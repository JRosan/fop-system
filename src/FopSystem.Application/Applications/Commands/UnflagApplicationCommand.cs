using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record UnflagApplicationCommand(
    Guid ApplicationId,
    string UnflaggedBy) : ICommand;

public sealed class UnflagApplicationCommandHandler : ICommandHandler<UnflagApplicationCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public UnflagApplicationCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(UnflagApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);

        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        if (!application.IsFlagged)
        {
            return Result.Failure(Error.Custom("Application.NotFlagged", "Application is not flagged"));
        }

        try
        {
            application.Unflag(request.UnflaggedBy);
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Application.InvalidOperation", ex.Message));
        }
    }
}
