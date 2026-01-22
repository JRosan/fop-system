using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Commands;

public sealed record ApproveApplicationCommand(
    Guid ApplicationId,
    string ApprovedBy,
    string? Notes = null) : ICommand<Guid>;

public sealed class ApproveApplicationCommandValidator : AbstractValidator<ApproveApplicationCommand>
{
    public ApproveApplicationCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.ApprovedBy).NotEmpty();
    }
}

public sealed class ApproveApplicationCommandHandler : ICommandHandler<ApproveApplicationCommand, Guid>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IAircraftRepository _aircraftRepository;
    private readonly IPermitRepository _permitRepository;

    public ApproveApplicationCommandHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IAircraftRepository aircraftRepository,
        IPermitRepository permitRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _aircraftRepository = aircraftRepository;
        _permitRepository = permitRepository;
    }

    public async Task<Result<Guid>> Handle(ApproveApplicationCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<Guid>(Error.NotFound);
        }

        var @operator = await _operatorRepository.GetByIdAsync(application.OperatorId, cancellationToken);
        var aircraft = await _aircraftRepository.GetByIdAsync(application.AircraftId, cancellationToken);

        if (@operator is null || aircraft is null)
        {
            return Result.Failure<Guid>(Error.Custom("Application.InvalidData", "Operator or aircraft not found"));
        }

        try
        {
            application.Approve(request.ApprovedBy, request.Notes);

            var permit = Permit.Issue(
                application.Id,
                application.ApplicationNumber,
                application.Type,
                @operator.Id,
                @operator.Name,
                aircraft.Id,
                aircraft.RegistrationMark,
                application.RequestedStartDate,
                application.RequestedEndDate,
                application.CalculatedFee,
                request.ApprovedBy);

            await _permitRepository.AddAsync(permit, cancellationToken);

            return Result.Success(permit.Id);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Guid>(Error.Custom("Application.InvalidOperation", ex.Message));
        }
    }
}
