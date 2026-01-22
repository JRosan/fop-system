using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Services;

namespace FopSystem.Application.Applications.Queries;

public sealed record CalculateFeeQuery(
    ApplicationType Type,
    int SeatCount,
    decimal MtowKg) : IQuery<FeeCalculationResultDto>;

public sealed class CalculateFeeQueryHandler : IQueryHandler<CalculateFeeQuery, FeeCalculationResultDto>
{
    private readonly IFeeCalculationService _feeCalculationService;

    public CalculateFeeQueryHandler(IFeeCalculationService feeCalculationService)
    {
        _feeCalculationService = feeCalculationService;
    }

    public Task<Result<FeeCalculationResultDto>> Handle(CalculateFeeQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var result = _feeCalculationService.Calculate(request.Type, request.SeatCount, request.MtowKg);

            var dto = new FeeCalculationResultDto(
                new MoneyDto(result.BaseFee.Amount, result.BaseFee.Currency.ToString()),
                new MoneyDto(result.SeatFee.Amount, result.SeatFee.Currency.ToString()),
                new MoneyDto(result.WeightFee.Amount, result.WeightFee.Currency.ToString()),
                result.Multiplier,
                new MoneyDto(result.TotalFee.Amount, result.TotalFee.Currency.ToString()),
                result.Breakdown.Select(b => new FeeBreakdownItemDto(
                    b.Description,
                    new MoneyDto(b.Amount.Amount, b.Amount.Currency.ToString()))).ToList());

            return Task.FromResult(Result.Success(dto));
        }
        catch (ArgumentException ex)
        {
            return Task.FromResult(Result.Failure<FeeCalculationResultDto>(
                Error.Custom("Fee.CalculationError", ex.Message)));
        }
    }
}
