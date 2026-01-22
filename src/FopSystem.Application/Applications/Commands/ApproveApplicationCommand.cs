using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Domain.Aggregates.Permit;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;

namespace FopSystem.Application.Applications.Commands;

public sealed record ApproveApplicationCommand(
    Guid ApplicationId,
    string ApprovedBy,
    string? Notes = null,
    bool BypassDebtCheck = false) : ICommand<Guid>;

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
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IAviationRevenueEngine _revenueEngine;

    public ApproveApplicationCommandHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IAircraftRepository aircraftRepository,
        IPermitRepository permitRepository,
        IOperatorAccountBalanceRepository accountBalanceRepository,
        IAviationRevenueEngine revenueEngine)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _aircraftRepository = aircraftRepository;
        _permitRepository = permitRepository;
        _accountBalanceRepository = accountBalanceRepository;
        _revenueEngine = revenueEngine;
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

        // Check for outstanding BVIAA debts (unless bypass is explicitly requested)
        if (!request.BypassDebtCheck)
        {
            var accountBalance = await _accountBalanceRepository.GetByOperatorIdAsync(
                application.OperatorId, cancellationToken);

            if (accountBalance is not null)
            {
                var eligibility = _revenueEngine.CheckPermitIssuanceEligibility(
                    accountBalance.TotalOverdue,
                    accountBalance.OverdueInvoiceCount);

                if (!eligibility.IsEligible)
                {
                    return Result.Failure<Guid>(Error.Custom(
                        "Permit.BlockedDueToDebt",
                        $"Cannot issue permit. Outstanding BVIAA debt: {eligibility.OutstandingDebt}. " +
                        $"Overdue invoices: {eligibility.OverdueInvoiceCount}. " +
                        "Please clear outstanding debts before permit issuance or use BypassDebtCheck with appropriate authorization."));
                }
            }
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
