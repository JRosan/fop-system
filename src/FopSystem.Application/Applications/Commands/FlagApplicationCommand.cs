using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record FlagApplicationCommand(
    Guid ApplicationId,
    string Reason,
    string FlaggedBy) : ICommand;

public sealed class FlagApplicationCommandHandler : ICommandHandler<FlagApplicationCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public FlagApplicationCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(FlagApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);

        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            application.Flag(request.Reason, request.FlaggedBy);
            return Result.Success();
        }
        catch (ArgumentException ex)
        {
            return Result.Failure(Error.Custom("Application.InvalidArgument", ex.Message));
        }
    }
}
