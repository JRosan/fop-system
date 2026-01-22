using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Revenue.Queries;

public sealed record CalculateBviaFeesQuery(
    decimal MtowLbs,
    FlightOperationType OperationType,
    BviAirport Airport,
    int PassengerCount = 0,
    int ParkingHours = 0,
    TimeOnly? ArrivalTime = null,
    TimeOnly? DepartureTime = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false) : IQuery<BviaFeeCalculationResultDto>;

public sealed class CalculateBviaFeesQueryHandler : IQueryHandler<CalculateBviaFeesQuery, BviaFeeCalculationResultDto>
{
    private readonly IBviaFeeCalculationService _feeCalculationService;

    public CalculateBviaFeesQueryHandler(IBviaFeeCalculationService feeCalculationService)
    {
        _feeCalculationService = feeCalculationService;
    }

    public Task<Result<BviaFeeCalculationResultDto>> Handle(CalculateBviaFeesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            OperatingWindow? operatingWindow = null;
            if (request.ArrivalTime.HasValue && request.DepartureTime.HasValue)
            {
                operatingWindow = OperatingWindow.Create(
                    request.ArrivalTime.Value,
                    request.DepartureTime.Value);
            }
            else if (request.ArrivalTime.HasValue)
            {
                operatingWindow = OperatingWindow.CreateWithArrivalOnly(request.ArrivalTime.Value);
            }

            var bviaRequest = new BviaFeeCalculationRequest(
                MtowLbs: request.MtowLbs,
                OperationType: request.OperationType,
                Airport: request.Airport,
                PassengerCount: request.PassengerCount,
                ParkingHours: request.ParkingHours,
                OperatingWindow: operatingWindow,
                RequiresCatViFire: request.RequiresCatViFire,
                IncludeFlightPlanFiling: request.IncludeFlightPlanFiling,
                FuelGallons: request.FuelGallons,
                IsInterisland: request.IsInterisland);

            var result = _feeCalculationService.Calculate(bviaRequest);

            var dto = new BviaFeeCalculationResultDto(
                TotalFee: new MoneyDto(result.TotalFee.Amount, result.TotalFee.Currency.ToString()),
                LandingFee: new MoneyDto(result.LandingFee.Amount, result.LandingFee.Currency.ToString()),
                NavigationFee: new MoneyDto(result.NavigationFee.Amount, result.NavigationFee.Currency.ToString()),
                MtowTier: result.MtowTier.ToString(),
                Breakdown: result.Breakdown.Select(b => new BviaFeeBreakdownItemDto(
                    Category: b.Category,
                    Description: b.Description,
                    Amount: new MoneyDto(b.Amount.Amount, b.Amount.Currency.ToString()))).ToList());

            return Task.FromResult(Result.Success(dto));
        }
        catch (ArgumentException ex)
        {
            return Task.FromResult(Result.Failure<BviaFeeCalculationResultDto>(
                Error.Custom("BviaFee.CalculationError", ex.Message)));
        }
    }
}
