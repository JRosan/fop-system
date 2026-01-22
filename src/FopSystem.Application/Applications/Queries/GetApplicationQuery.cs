using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Application;
using FopSystem.Domain.Repositories;

namespace FopSystem.Application.Applications.Queries;

public sealed record GetApplicationQuery(Guid ApplicationId) : IQuery<ApplicationDto>;

public sealed class GetApplicationQueryHandler : IQueryHandler<GetApplicationQuery, ApplicationDto>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IOperatorRepository _operatorRepository;
    private readonly IAircraftRepository _aircraftRepository;

    public GetApplicationQueryHandler(
        IApplicationRepository applicationRepository,
        IOperatorRepository operatorRepository,
        IAircraftRepository aircraftRepository)
    {
        _applicationRepository = applicationRepository;
        _operatorRepository = operatorRepository;
        _aircraftRepository = aircraftRepository;
    }

    public async Task<Result<ApplicationDto>> Handle(GetApplicationQuery request, CancellationToken cancellationToken)
    {
        var application = await _applicationRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application is null)
        {
            return Result.Failure<ApplicationDto>(Error.NotFound);
        }

        var @operator = await _operatorRepository.GetByIdAsync(application.OperatorId, cancellationToken);
        var aircraft = await _aircraftRepository.GetByIdAsync(application.AircraftId, cancellationToken);

        if (@operator is null || aircraft is null)
        {
            return Result.Failure<ApplicationDto>(Error.Custom("Application.InvalidData", "Operator or aircraft not found"));
        }

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
            app.Documents.Select(d => new DocumentSummaryDto(
                d.Id, d.Type, d.FileName, d.Status, d.ExpiryDate, d.UploadedAt)).ToList(),
            app.Payment is not null
                ? new PaymentDto(app.Payment.Id, app.Payment.ApplicationId,
                    new MoneyDto(app.Payment.Amount.Amount, app.Payment.Amount.Currency.ToString()),
                    app.Payment.Method, app.Payment.Status, app.Payment.TransactionReference,
                    app.Payment.PaymentDate, app.Payment.ReceiptNumber, app.Payment.ReceiptUrl,
                    app.Payment.FailureReason, app.Payment.IsVerified, app.Payment.VerifiedBy,
                    app.Payment.VerifiedAt, app.Payment.VerificationNotes,
                    app.Payment.CreatedAt, app.Payment.UpdatedAt)
                : null,
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
