using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record StartReviewCommand(Guid ApplicationId, string ReviewerUserId) : ICommand;

public sealed class StartReviewCommandValidator : AbstractValidator<StartReviewCommand>
{
    public StartReviewCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.ReviewerUserId).NotEmpty();
    }
}

public sealed class StartReviewCommandHandler : ICommandHandler<StartReviewCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public StartReviewCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(StartReviewCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            application.StartReview(request.ReviewerUserId);
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Application.InvalidOperation", ex.Message));
        }
        catch (ArgumentException ex)
        {
            return Result.Failure(Error.Custom("Application.InvalidArgument", ex.Message));
        }
    }
}
