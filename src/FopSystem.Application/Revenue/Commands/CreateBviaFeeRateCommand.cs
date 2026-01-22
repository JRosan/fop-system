using FluentValidation;
using FopSystem.Application.Common;
using FopSystem.Application.DTOs;
using FopSystem.Domain.Aggregates.Revenue;
using FopSystem.Domain.Enums;
using FopSystem.Domain.Repositories;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Application.Revenue.Commands;

public sealed record CreateBviaFeeRateCommand(
    BviaFeeCategory Category,
    FlightOperationType OperationType,
    decimal RateAmount,
    bool IsPerUnit,
    string? UnitDescription,
    DateOnly EffectiveFrom,
    BviAirport? Airport = null,
    MtowTierLevel? MtowTier = null,
    decimal? MinimumFeeAmount = null,
    string? Description = null) : ICommand<BviaFeeRateDto>;

public sealed class CreateBviaFeeRateCommandValidator : AbstractValidator<CreateBviaFeeRateCommand>
{
    public CreateBviaFeeRateCommandValidator()
    {
        RuleFor(x => x.RateAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.UnitDescription)
            .NotEmpty()
            .When(x => x.IsPerUnit)
            .WithMessage("Unit description is required when rate is per unit");
        RuleFor(x => x.MinimumFeeAmount).GreaterThanOrEqualTo(0).When(x => x.MinimumFeeAmount.HasValue);
    }
}

public sealed class CreateBviaFeeRateCommandHandler : ICommandHandler<CreateBviaFeeRateCommand, BviaFeeRateDto>
{
    private readonly IBviaFeeRateRepository _feeRateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBviaFeeRateCommandHandler(
        IBviaFeeRateRepository feeRateRepository,
        IUnitOfWork unitOfWork)
    {
        _feeRateRepository = feeRateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BviaFeeRateDto>> Handle(CreateBviaFeeRateCommand request, CancellationToken cancellationToken)
    {
        var rate = Money.Usd(request.RateAmount);
        var minimumFee = request.MinimumFeeAmount.HasValue
            ? Money.Usd(request.MinimumFeeAmount.Value)
            : null;

        var feeRate = BviaFeeRate.Create(
            category: request.Category,
            operationType: request.OperationType,
            rate: rate,
            isPerUnit: request.IsPerUnit,
            unitDescription: request.UnitDescription,
            effectiveFrom: request.EffectiveFrom,
            airport: request.Airport,
            mtowTier: request.MtowTier,
            minimumFee: minimumFee,
            description: request.Description);

        await _feeRateRepository.AddAsync(feeRate, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(MapToDto(feeRate));
    }

    private static BviaFeeRateDto MapToDto(BviaFeeRate rate)
    {
        return new BviaFeeRateDto(
            Id: rate.Id,
            Category: rate.Category,
            OperationType: rate.OperationType,
            Airport: rate.Airport,
            MtowTier: rate.MtowTier?.ToString(),
            Rate: new MoneyDto(rate.Rate.Amount, rate.Rate.Currency.ToString()),
            IsPerUnit: rate.IsPerUnit,
            UnitDescription: rate.UnitDescription,
            MinimumFee: rate.MinimumFee != null
                ? new MoneyDto(rate.MinimumFee.Amount, rate.MinimumFee.Currency.ToString())
                : null,
            EffectiveFrom: rate.EffectiveFrom,
            EffectiveTo: rate.EffectiveTo,
            Description: rate.Description,
            IsActive: rate.IsActive,
            CreatedAt: rate.CreatedAt,
            UpdatedAt: rate.UpdatedAt);
    }
}
