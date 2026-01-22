using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services;

public interface IAviationRevenueEngine
{
    UnifiedFeeCalculationResult CalculateUnifiedFees(UnifiedFeeCalculationRequest request);
    PermitIssuanceEligibility CheckPermitIssuanceEligibility(
        Money totalOverdue,
        int overdueInvoiceCount);
}

public class AviationRevenueEngine : IAviationRevenueEngine
{
    private readonly IFeeCalculationService _fopFeeService;
    private readonly IBviaFeeCalculationService _bviaFeeService;

    public AviationRevenueEngine(
        IFeeCalculationService fopFeeService,
        IBviaFeeCalculationService bviaFeeService)
    {
        _fopFeeService = fopFeeService;
        _bviaFeeService = bviaFeeService;
    }

    public UnifiedFeeCalculationResult CalculateUnifiedFees(UnifiedFeeCalculationRequest request)
    {
        // Calculate FOP permit fees
        var fopResult = _fopFeeService.Calculate(
            request.ApplicationType,
            request.SeatCount,
            request.MtowKg);

        // Calculate BVIAA operational fees
        var bviaRequest = new BviaFeeCalculationRequest(
            MtowLbs: request.MtowKg * 2.20462m, // Convert to lbs
            OperationType: request.OperationType,
            Airport: request.Airport,
            PassengerCount: request.PassengerCount,
            ParkingHours: request.ParkingHours,
            OperatingWindow: request.OperatingWindow,
            RequiresCatViFire: request.RequiresCatViFire,
            IncludeFlightPlanFiling: request.IncludeFlightPlanFiling,
            FuelGallons: request.FuelGallons,
            IsInterisland: request.IsInterisland);

        var bviaResult = _bviaFeeService.Calculate(bviaRequest);

        // Combine totals
        var grandTotal = fopResult.TotalFee.Add(bviaResult.TotalFee);

        // Build unified breakdown
        var unifiedBreakdown = new List<UnifiedFeeBreakdownItem>();

        // Add FOP fees
        foreach (var item in fopResult.Breakdown)
        {
            unifiedBreakdown.Add(new UnifiedFeeBreakdownItem(
                Source: FeeSource.FOP,
                Category: item.Description,
                Description: item.Description,
                Amount: item.Amount));
        }

        // Add BVIAA fees
        foreach (var item in bviaResult.Breakdown)
        {
            unifiedBreakdown.Add(new UnifiedFeeBreakdownItem(
                Source: FeeSource.BVIAA,
                Category: item.Category.ToString(),
                Description: item.Description,
                Amount: item.Amount));
        }

        return new UnifiedFeeCalculationResult(
            FopFees: fopResult.TotalFee,
            BviaFees: bviaResult.TotalFee,
            GrandTotal: grandTotal,
            FopBreakdown: fopResult.Breakdown,
            BviaBreakdown: bviaResult.Breakdown,
            UnifiedBreakdown: unifiedBreakdown);
    }

    public PermitIssuanceEligibility CheckPermitIssuanceEligibility(
        Money totalOverdue,
        int overdueInvoiceCount)
    {
        var isEligible = totalOverdue.Amount == 0;

        var reasons = new List<string>();
        if (!isEligible)
        {
            reasons.Add($"Outstanding BVIAA debt: {totalOverdue}");
            reasons.Add($"Overdue invoices: {overdueInvoiceCount}");
        }

        return new PermitIssuanceEligibility(
            IsEligible: isEligible,
            OutstandingDebt: totalOverdue,
            OverdueInvoiceCount: overdueInvoiceCount,
            BlockReasons: reasons);
    }
}

public sealed record UnifiedFeeCalculationRequest(
    ApplicationType ApplicationType,
    FlightOperationType OperationType,
    BviAirport Airport,
    int SeatCount,
    decimal MtowKg,
    int PassengerCount = 0,
    int ParkingHours = 0,
    OperatingWindow? OperatingWindow = null,
    bool RequiresCatViFire = false,
    bool IncludeFlightPlanFiling = false,
    decimal FuelGallons = 0,
    bool IsInterisland = false);

public sealed record UnifiedFeeCalculationResult(
    Money FopFees,
    Money BviaFees,
    Money GrandTotal,
    IReadOnlyList<FeeBreakdownItem> FopBreakdown,
    IReadOnlyList<BviaFeeBreakdownItem> BviaBreakdown,
    IReadOnlyList<UnifiedFeeBreakdownItem> UnifiedBreakdown);

public sealed record UnifiedFeeBreakdownItem(
    FeeSource Source,
    string Category,
    string Description,
    Money Amount);

public enum FeeSource
{
    FOP = 1,
    BVIAA = 2
}

public sealed record PermitIssuanceEligibility(
    bool IsEligible,
    Money OutstandingDebt,
    int OverdueInvoiceCount,
    IReadOnlyList<string> BlockReasons);
