using FopSystem.Application.Applications.Commands;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class DocumentEndpoints
{
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB

    public static void MapDocumentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/documents")
            .WithTags("Documents")
            .WithOpenApi();

        group.MapPost("/upload", UploadDocument)
            .WithName("UploadDocument")
            .WithSummary("Upload a document for an application")
            .Produces<DocumentSummaryDto>(201)
            .Produces<ProblemDetails>(400)
            .DisableAntiforgery();

        group.MapPost("/{documentId:guid}/verify", VerifyDocument)
            .WithName("VerifyDocument")
            .WithSummary("Verify or reject a document")
            .Produces(204)
            .Produces<ProblemDetails>(400)
            .AllowAnonymous();

        group.MapGet("/{documentId:guid}/download", DownloadDocument)
            .WithName("DownloadDocument")
            .WithSummary("Download a document")
            .Produces(200)
            .Produces(404);
    }

    private static async Task<IResult> UploadDocument(
        [FromServices] IApplicationRepository applicationRepository,
        [FromServices] IBlobStorageService blobStorageService,
        [FromServices] IUnitOfWork unitOfWork,
        HttpContext httpContext,
        [FromForm] Guid applicationId,
        [FromForm] DocumentType type,
        [FromForm] IFormFile file,
        [FromForm] DateOnly? expiryDate = null,
        CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
        {
            return Results.Problem("File is empty", statusCode: 400);
        }

        if (file.Length > MaxFileSize)
        {
            return Results.Problem($"File size exceeds maximum allowed size of {MaxFileSize / 1024 / 1024}MB", statusCode: 400);
        }

        var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png" };
        if (!allowedTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return Results.Problem("Only PDF, JPEG, and PNG files are allowed", statusCode: 400);
        }

        var application = await applicationRepository.GetByIdAsync(applicationId, cancellationToken);
        if (application is null)
        {
            return Results.NotFound();
        }

        try
        {
            await using var stream = file.OpenReadStream();
            var blobUrl = await blobStorageService.UploadDocumentAsync(
                stream,
                file.FileName,
                file.ContentType,
                "documents",
                cancellationToken);

            var userId = httpContext.User.Identity?.Name ?? "anonymous";

            var document = ApplicationDocument.Create(
                applicationId,
                type,
                file.FileName,
                file.Length,
                file.ContentType,
                blobUrl,
                userId,
                expiryDate);

            application.AddDocument(document);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new DocumentSummaryDto(
                document.Id,
                document.Type,
                document.FileName,
                document.Status,
                document.ExpiryDate,
                document.UploadedAt);

            return Results.Created($"/api/documents/{document.Id}", dto);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(ex.Message, statusCode: 400);
        }
    }

    private static async Task<IResult> VerifyDocument(
        [FromServices] IMediator mediator,
        HttpContext httpContext,
        Guid documentId,
        [FromBody] VerifyDocumentRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = httpContext.User.Identity?.Name ?? "system";

        var command = new VerifyDocumentCommand(
            request.ApplicationId,
            documentId,
            request.IsVerified,
            userId,
            request.RejectionReason);

        var result = await mediator.Send(command, cancellationToken);

        return result.IsSuccess
            ? Results.NoContent()
            : result.Error?.Code == "Error.NotFound"
                ? Results.NotFound()
                : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> DownloadDocument(
        [FromServices] IBlobStorageService blobStorageService,
        [FromServices] IApplicationRepository applicationRepository,
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        // Find the document in all applications
        var applications = await applicationRepository.GetAllAsync(cancellationToken);
        var document = applications
            .SelectMany(a => a.Documents)
            .FirstOrDefault(d => d.Id == documentId);

        if (document is null)
        {
            return Results.NotFound();
        }

        var stream = await blobStorageService.DownloadDocumentAsync(document.BlobUrl, cancellationToken);
        if (stream is null)
        {
            return Results.NotFound();
        }

        return Results.File(stream, document.MimeType, document.FileName);
    }
}

public sealed record VerifyDocumentRequest(
    Guid ApplicationId,
    bool IsVerified,
    string? RejectionReason);
