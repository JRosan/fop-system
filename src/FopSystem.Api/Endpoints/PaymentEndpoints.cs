using FopSystem.Application.Applications.Commands;
using FopSystem.Application.DTOs;
using FopSystem.Application.Payments.Commands;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FopSystem.Api.Endpoints;

public static class PaymentEndpoints
{
    public static void MapPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments")
            .WithTags("Payments")
            .WithOpenApi();

        group.MapGet("/", GetAllPayments)
            .WithName("GetAllPayments")
            .WithSummary("Get all payments with optional filtering")
            .AllowAnonymous();

        group.MapPost("/process", ProcessPayment)
            .WithName("ProcessPayment")
            .WithSummary("Process a payment for an application")
            .Produces<PaymentResultDto>()
            .Produces<ProblemDetails>(400);

        group.MapGet("/application/{applicationId:guid}", GetPaymentByApplication)
            .WithName("GetPaymentByApplication")
            .WithSummary("Get payment details for an application")
            .Produces<PaymentDto>()
            .Produces(404);

        group.MapGet("/receipt/{applicationId:guid}", GetPaymentReceipt)
            .WithName("GetPaymentReceipt")
            .WithSummary("Get payment receipt for an application")
            .Produces<PaymentReceiptDto>()
            .Produces(404);

        group.MapPost("/{applicationId:guid}/verify", VerifyPayment)
            .WithName("VerifyPayment")
            .WithSummary("Finance officer verifies a completed payment")
            .RequireAuthorization("FinanceOfficer")
            .Produces(200)
            .Produces<ProblemDetails>(400)
            .Produces(404);
    }

    private static async Task<IResult> ProcessPayment(
        [FromServices] IMediator mediator,
        [FromBody] ProcessPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new ProcessPaymentCommand(
            request.ApplicationId,
            request.Method,
            request.TransactionReference);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Ok(new PaymentResultDto(true, result.Value, "Payment processed successfully"));
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetPaymentByApplication(
        [FromServices] IApplicationRepository applicationRepository,
        Guid applicationId,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(applicationId, cancellationToken);
        if (application?.Payment is null)
        {
            return Results.NotFound();
        }

        var payment = application.Payment;
        var dto = new PaymentDto(
            payment.Id,
            payment.ApplicationId,
            new MoneyDto(payment.Amount.Amount, payment.Amount.Currency.ToString()),
            payment.Method,
            payment.Status,
            payment.TransactionReference,
            payment.PaymentDate,
            payment.ReceiptNumber,
            payment.ReceiptUrl,
            payment.FailureReason,
            payment.IsVerified,
            payment.VerifiedBy,
            payment.VerifiedAt,
            payment.VerificationNotes,
            payment.CreatedAt,
            payment.UpdatedAt);

        return Results.Ok(dto);
    }

    private static async Task<IResult> GetPaymentReceipt(
        [FromServices] IApplicationRepository applicationRepository,
        [FromServices] IOperatorRepository operatorRepository,
        Guid applicationId,
        CancellationToken cancellationToken = default)
    {
        var application = await applicationRepository.GetByIdAsync(applicationId, cancellationToken);
        if (application?.Payment is null || application.Payment.Status != PaymentStatus.Completed)
        {
            return Results.NotFound();
        }

        var @operator = await operatorRepository.GetByIdAsync(application.OperatorId, cancellationToken);
        if (@operator is null)
        {
            return Results.NotFound();
        }

        var payment = application.Payment;
        var receipt = new PaymentReceiptDto(
            payment.ReceiptNumber!,
            application.ApplicationNumber,
            @operator.Name,
            new MoneyDto(payment.Amount.Amount, payment.Amount.Currency.ToString()),
            payment.Method.ToString(),
            payment.PaymentDate!.Value,
            $"Foreign Operator Permit Fee - {application.Type}",
            "BVI Civil Aviation Department",
            DateTime.UtcNow);

        return Results.Ok(receipt);
    }

    private static async Task<IResult> VerifyPayment(
        [FromServices] IMediator mediator,
        Guid applicationId,
        [FromBody] VerifyPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        var command = new VerifyPaymentCommand(
            applicationId,
            request.VerifiedBy,
            request.Notes);

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Ok(new { message = "Payment verified successfully" });
        }

        return result.Error?.Code == "Error.NotFound"
            ? Results.NotFound()
            : Results.Problem(result.Error!.Message, statusCode: 400);
    }

    private static async Task<IResult> GetAllPayments(
        [FromServices] IApplicationRepository applicationRepository,
        [FromQuery] PaymentStatus[]? status = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        // Get applications that have payments
        var (applications, totalCount) = await applicationRepository.GetPagedAsync(
            pageNumber: pageNumber,
            pageSize: pageSize,
            cancellationToken: cancellationToken);

        var paymentsWithApplications = applications
            .Where(a => a.Payment != null)
            .Where(a => status == null || status.Length == 0 || status.Contains(a.Payment!.Status))
            .Select(a => new
            {
                payment = new PaymentDto(
                    a.Payment!.Id,
                    a.Payment.ApplicationId,
                    new MoneyDto(a.Payment.Amount.Amount, a.Payment.Amount.Currency.ToString()),
                    a.Payment.Method,
                    a.Payment.Status,
                    a.Payment.TransactionReference,
                    a.Payment.PaymentDate,
                    a.Payment.ReceiptNumber,
                    a.Payment.ReceiptUrl,
                    a.Payment.FailureReason,
                    a.Payment.IsVerified,
                    a.Payment.VerifiedBy,
                    a.Payment.VerifiedAt,
                    a.Payment.VerificationNotes,
                    a.Payment.CreatedAt,
                    a.Payment.UpdatedAt),
                applicationNumber = a.ApplicationNumber,
                operatorName = a.Operator?.Name ?? "Unknown"
            })
            .ToList();

        return Results.Ok(new
        {
            items = paymentsWithApplications,
            totalCount = paymentsWithApplications.Count,
            pageNumber,
            pageSize,
            totalPages = (int)Math.Ceiling(paymentsWithApplications.Count / (double)pageSize),
            hasPreviousPage = pageNumber > 1,
            hasNextPage = pageNumber * pageSize < paymentsWithApplications.Count
        });
    }
}

public sealed record VerifyPaymentRequest(
    string VerifiedBy,
    string? Notes = null);

public sealed record ProcessPaymentRequest(
    Guid ApplicationId,
    PaymentMethod Method,
    string TransactionReference);

public sealed record PaymentResultDto(
    bool Success,
    string ReceiptNumber,
    string Message);

public sealed record PaymentReceiptDto(
    string ReceiptNumber,
    string ApplicationNumber,
    string OperatorName,
    MoneyDto Amount,
    string PaymentMethod,
    DateTime PaymentDate,
    string Description,
    string IssuedBy,
    DateTime IssuedAt);
