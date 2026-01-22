using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Exceptions;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record VerifyDocumentCommand(
    Guid ApplicationId,
    Guid DocumentId,
    bool IsVerified,
    string VerifiedBy,
    string? RejectionReason = null) : ICommand;

public sealed class VerifyDocumentCommandValidator : AbstractValidator<VerifyDocumentCommand>
{
    public VerifyDocumentCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.DocumentId).NotEmpty();
        RuleFor(x => x.VerifiedBy).NotEmpty();
        RuleFor(x => x.RejectionReason)
            .NotEmpty()
            .When(x => !x.IsVerified)
            .WithMessage("Rejection reason is required when rejecting a document");
    }
}

public sealed class VerifyDocumentCommandHandler : ICommandHandler<VerifyDocumentCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public VerifyDocumentCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(VerifyDocumentCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            if (request.IsVerified)
            {
                application.VerifyDocument(request.DocumentId, request.VerifiedBy);
            }
            else
            {
                application.RejectDocument(request.DocumentId, request.RejectionReason!, request.VerifiedBy);
            }

            return Result.Success();
        }
        catch (DocumentExpiredException ex)
        {
            return Result.Failure(Error.Custom(
                "Document.Expired",
                $"Cannot verify document: {ex.DocumentType} expired on {ex.ExpiryDate:yyyy-MM-dd}. Please request an updated document from the applicant."));
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Document.InvalidOperation", ex.Message));
        }
    }
}
