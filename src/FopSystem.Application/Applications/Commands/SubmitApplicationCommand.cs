using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record SubmitApplicationCommand(Guid ApplicationId) : ICommand;

public sealed class SubmitApplicationCommandValidator : AbstractValidator<SubmitApplicationCommand>
{
    public SubmitApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
    }
}

public sealed class SubmitApplicationCommandHandler : ICommandHandler<SubmitApplicationCommand>
{
    private readonly IApplicationRepository _applicationRepository;

    public SubmitApplicationCommandHandler(IApplicationRepository applicationRepository)
    {
        _applicationRepository = applicationRepository;
    }

    public async Task<Result> Handle(SubmitApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure(Error.NotFound);
        }

        try
        {
            application.Submit();
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(Error.Custom("Application.InvalidOperation", ex.Message));
        }
    }
}
