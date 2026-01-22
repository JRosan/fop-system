using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Services;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Revenue.Queries;

public sealed record CalculateUnifiedFeesQuery(
    ApplicationType ApplicationType,
    FlightOperationType OperationType,
    BviAirport Airport,
    int SeatCount,
    decimal MtowKg,
    int PassengerCount = 0,
    int ParkingHours = 0,
    TimeOnly? ArrivalTime = null,
    TimeOnly? DepartureTime = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false) : IQuery<UnifiedFeeCalculationResultDto>;

public sealed class CalculateUnifiedFeesQueryHandler : IQueryHandler<CalculateUnifiedFeesQuery, UnifiedFeeCalculationResultDto>
{
    private readonly IAviationRevenueEngine _revenueEngine;

    public CalculateUnifiedFeesQueryHandler(IAviationRevenueEngine revenueEngine)
    {
        _revenueEngine = revenueEngine;
    }

    public Task<Result<UnifiedFeeCalculationResultDto>> Handle(CalculateUnifiedFeesQuery request, CancellationToken cancellationToken)
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

            var unifiedRequest = new UnifiedFeeCalculationRequest(
                ApplicationType: request.ApplicationType,
                OperationType: request.OperationType,
                Airport: request.Airport,
                SeatCount: request.SeatCount,
                MtowKg: request.MtowKg,
                PassengerCount: request.PassengerCount,
                ParkingHours: request.ParkingHours,
                OperatingWindow: operatingWindow,
                RequiresCatViFire: request.RequiresCatViFire,
                IncludeFlightPlanFiling: request.IncludeFlightPlanFiling,
                FuelGallons: request.FuelGallons,
                IsInterisland: request.IsInterisland);

            var result = _revenueEngine.CalculateUnifiedFees(unifiedRequest);

            var dto = new UnifiedFeeCalculationResultDto(
                FopFees: new MoneyDto(result.FopFees.Amount, result.FopFees.Currency.ToString()),
                BviaFees: new MoneyDto(result.BviaFees.Amount, result.BviaFees.Currency.ToString()),
                GrandTotal: new MoneyDto(result.GrandTotal.Amount, result.GrandTotal.Currency.ToString()),
                FopBreakdown: result.FopBreakdown.Select(b => new FeeBreakdownItemDto(
                    Description: b.Description,
                    Amount: new MoneyDto(b.Amount.Amount, b.Amount.Currency.ToString()))).ToList(),
                BviaBreakdown: result.BviaBreakdown.Select(b => new BviaFeeBreakdownItemDto(
                    Category: b.Category,
                    Description: b.Description,
                    Amount: new MoneyDto(b.Amount.Amount, b.Amount.Currency.ToString()))).ToList(),
                UnifiedBreakdown: result.UnifiedBreakdown.Select(b => new UnifiedFeeBreakdownItemDto(
                    Source: b.Source.ToString(),
                    Category: b.Category,
                    Description: b.Description,
                    Amount: new MoneyDto(b.Amount.Amount, b.Amount.Currency.ToString()))).ToList());

            return Task.FromResult(Result.Success(dto));
        }
        catch (ArgumentException ex)
        {
            return Task.FromResult(Result.Failure<UnifiedFeeCalculationResultDto>(
                Error.Custom("UnifiedFee.CalculationError", ex.Message)));
        }
    }
}
