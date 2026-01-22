using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Events;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FopSystem.Application.Revenue.EventHandlers;

public sealed class ApplicationSubmittedBviaInvoiceHandler : INotificationHandler<ApplicationSubmittedEvent>
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IAircraftRepository _aircraftRepository;
    private readonly IBviaInvoiceRepository _invoiceRepository;
    private readonly IOperatorAccountBalanceRepository _accountBalanceRepository;
    private readonly IBviaFeeCalculationService _feeCalculationService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ApplicationSubmittedBviaInvoiceHandler> _logger;

    public ApplicationSubmittedBviaInvoiceHandler(
        IApplicationRepository applicationRepository,
        IAircraftRepository aircraftRepository,
        IBviaInvoiceRepository invoiceRepository,
        IOperatorAccountBalanceRepository accountBalanceRepository,
        IBviaFeeCalculationService feeCalculationService,
        IUnitOfWork unitOfWork,
        ILogger<ApplicationSubmittedBviaInvoiceHandler> logger)
    {
        _applicationRepository = applicationRepository;
        _aircraftRepository = aircraftRepository;
        _invoiceRepository = invoiceRepository;
        _accountBalanceRepository = accountBalanceRepository;
        _feeCalculationService = feeCalculationService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Handle(ApplicationSubmittedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Creating BVIAA pre-arrival invoice for application {ApplicationId} ({ApplicationNumber})",
            notification.ApplicationId, notification.ApplicationNumber);

        try
        {
            // Get application details
            var application = await _applicationRepository.GetByIdAsync(notification.ApplicationId, cancellationToken);
            if (application is null)
            {
                _logger.LogWarning("Application {ApplicationId} not found", notification.ApplicationId);
                return;
            }

            // Get aircraft details for MTOW
            var aircraft = await _aircraftRepository.GetByIdAsync(application.AircraftId, cancellationToken);
            if (aircraft is null)
            {
                _logger.LogWarning("Aircraft {AircraftId} not found for application {ApplicationId}",
                    application.AircraftId, notification.ApplicationId);
                return;
            }

            // Determine operation type based on application type
            var operationType = application.Type switch
            {
                ApplicationType.Emergency => FlightOperationType.Emergency,
                ApplicationType.Blanket => FlightOperationType.Charter,
                _ => FlightOperationType.GeneralAviation
            };

            // Default to TB Lettsome for now (could be enhanced to get from flight details)
            var arrivalAirport = BviAirport.TUPJ;

            // Create the invoice
            var mtow = aircraft.Mtow;
            var invoice = BviaInvoice.Create(
                operatorId: application.OperatorId,
                arrivalAirport: arrivalAirport,
                departureAirport: null,
                operationType: operationType,
                flightDate: application.FlightDetails.EstimatedFlightDate,
                aircraftRegistration: aircraft.RegistrationMark,
                mtow: mtow,
                seatCount: aircraft.SeatCount,
                passengerCount: application.FlightDetails.NumberOfPassengers,
                fopApplicationId: application.Id,
                notes: $"Auto-generated from FOP Application {notification.ApplicationNumber}");

            // Calculate fees
            var feeRequest = new BviaFeeCalculationRequest(
                MtowLbs: mtow.InPounds,
                OperationType: operationType,
                Airport: arrivalAirport,
                PassengerCount: application.FlightDetails.NumberOfPassengers ?? 0);

            var feeResult = _feeCalculationService.Calculate(feeRequest);

            // Add line items from fee calculation
            foreach (var item in feeResult.Breakdown)
            {
                invoice.AddLineItem(
                    category: item.Category,
                    description: item.Description,
                    quantity: 1,
                    quantityUnit: null,
                    unitRate: item.Amount);
            }

            await _invoiceRepository.AddAsync(invoice, cancellationToken);

            // Ensure account balance exists
            await _accountBalanceRepository.GetOrCreateAsync(application.OperatorId, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Created BVIAA invoice {InvoiceNumber} for application {ApplicationNumber} with total {TotalAmount}",
                invoice.InvoiceNumber, notification.ApplicationNumber, invoice.TotalAmount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error creating BVIAA invoice for application {ApplicationId}",
                notification.ApplicationId);
            // Don't rethrow - we don't want invoice creation failures to break the application submission
        }
    }
}
