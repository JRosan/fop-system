using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;

namespace FopSystem.Application.Applications.Commands;

public sealed record CreateApplicationCommand(
    ApplicationType Type,
    Guid OperatorId,
    Guid AircraftId,
    FlightPurpose FlightPurpose,
    string? FlightPurposeDescription,
    string ArrivalAirport,
    string DepartureAirport,
    DateOnly EstimatedFlightDate,
    int? NumberOfPassengers,
    string? CargoDescription,
    DateOnly RequestedStartDate,
    DateOnly RequestedEndDate) : ICommand<ApplicationDto>;

public sealed class CreateApplicationCommandValidator : AbstractValidator<CreateApplicationCommand>
{
    public CreateApplicationCommandValidator()
    {
        RuleFor(x => x.OperatorId).NotEmpty();
        RuleFor(x => x.AircraftId).NotEmpty();
        RuleFor(x => x.ArrivalAirport).NotEmpty().MaximumLength(10);
        RuleFor(x => x.DepartureAirport).NotEmpty().MaximumLength(10);
        RuleFor(x => x.EstimatedFlightDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date));
        RuleFor(x => x.RequestedStartDate).GreaterThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow.Date));
        RuleFor(x => x.RequestedEndDate).GreaterThanOrEqualTo(x => x.RequestedStartDate);
        RuleFor(x => x.FlightPurposeDescription)
            .NotEmpty()
            .When(x => x.FlightPurpose == FlightPurpose.Other);
        RuleFor(x => x.NumberOfPassengers)
            .GreaterThanOrEqualTo(0)
            .When(x => x.NumberOfPassengers.HasValue);
    }
}

public sealed class CreateApplicationCommandHandler : ICommandHandler<CreateApplicationCommand, ApplicationDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IAircraftRepository _aircraftRepository;
    private readonly IFeeCalculationService _feeCalculationService;

    public CreateApplicationCommandHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IAircraftRepository aircraftRepository,
        IFeeCalculationService feeCalculationService)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _aircraftRepository = aircraftRepository;
        _feeCalculationService = feeCalculationService;
    }

    public async Task<Result<ApplicationDto>> Handle(
        CreateApplicationCommand request,
        CancellationToken cancellationToken)
    {
        var @operator = await _operatorRepository.GetByIdAsync(request.OperatorId, cancellationToken);
        if (@operator is null)
        {
            return Result.Failure<ApplicationDto>(Error.Custom("Operator.NotFound", "Operator not found"));
        }

        var aircraft = await _aircraftRepository.GetByIdAsync(request.AircraftId, cancellationToken);
        if (aircraft is null)
        {
            return Result.Failure<ApplicationDto>(Error.Custom("Aircraft.NotFound", "Aircraft not found"));
        }

        if (aircraft.OperatorId != request.OperatorId)
        {
            return Result.Failure<ApplicationDto>(
                Error.Custom("Aircraft.InvalidOperator", "Aircraft does not belong to the specified operator"));
        }

        var feeResult = _feeCalculationService.Calculate(
            request.Type,
            aircraft.SeatCount,
            aircraft.MtowInKilograms);

        var flightDetails = FlightDetails.Create(
            request.FlightPurpose,
            request.ArrivalAirport,
            request.DepartureAirport,
            request.EstimatedFlightDate,
            request.FlightPurposeDescription,
            request.NumberOfPassengers,
            request.CargoDescription);

        var application = FopApplication.Create(
            request.Type,
            request.OperatorId,
            request.AircraftId,
            flightDetails,
            request.RequestedStartDate,
            request.RequestedEndDate,
            feeResult.TotalFee);

        await _applicationRepository.AddAsync(application, cancellationToken);

        return Result.Success(MapToDto(application, @operator, aircraft));
    }

    private static ApplicationDto MapToDto(
        FopApplication app,
        Domain.Aggregates.Operator.Operator @operator,
        Domain.Aggregates.Aircraft.Aircraft aircraft)
    {
        return new ApplicationDto(
            app.Id,
            app.ApplicationNumber,
            app.Type,
            app.Status,
            new OperatorSummaryDto(@operator.Id, @operator.Name, @operator.Country, @operator.AocNumber, @operator.AocExpiryDate),
            new AircraftSummaryDto(aircraft.Id, aircraft.RegistrationMark, aircraft.Manufacturer, aircraft.Model,
                new WeightDto(aircraft.Mtow.Value, aircraft.Mtow.Unit.ToString()), aircraft.SeatCount),
            new FlightDetailsDto(app.FlightDetails.Purpose, app.FlightDetails.PurposeDescription,
                app.FlightDetails.ArrivalAirport, app.FlightDetails.DepartureAirport,
                app.FlightDetails.EstimatedFlightDate, app.FlightDetails.NumberOfPassengers,
                app.FlightDetails.CargoDescription),
            app.RequestedStartDate,
            app.RequestedEndDate,
            new MoneyDto(app.CalculatedFee.Amount, app.CalculatedFee.Currency.ToString()),
            [],
            null,
            app.SubmittedAt,
            app.ReviewedAt,
            app.ReviewedBy,
            app.ReviewNotes,
            app.ApprovedAt,
            app.ApprovedBy,
            app.RejectionReason,
            app.CreatedAt,
            app.UpdatedAt);
    }
}
