using FopSystem.Domain.Entities;
using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// FOP fee policy that loads rates from a FeeConfiguration entity.
/// Falls back to default policy if configuration is null.
/// </summary>
public class DatabaseFopFeePolicy : IFopFeePolicy
{
    private readonly FeeConfiguration? _configuration;
    private readonly IFopFeePolicy _fallbackPolicy;

    public DatabaseFopFeePolicy(FeeConfiguration? configuration)
        : this(configuration, new DefaultFopFeePolicy())
    {
    }

    public DatabaseFopFeePolicy(FeeConfiguration? configuration, IFopFeePolicy fallbackPolicy)
    {
        _configuration = configuration;
        _fallbackPolicy = fallbackPolicy;
    }

    public Money GetBaseFee() =>
        _configuration is not null
            ? Money.Usd(_configuration.BaseFeeUsd)
            : _fallbackPolicy.GetBaseFee();

    public Money GetPerSeatFee() =>
        _configuration is not null
            ? Money.Usd(_configuration.PerSeatFeeUsd)
            : _fallbackPolicy.GetPerSeatFee();

    public Money GetPerKgFee() =>
        _configuration is not null
            ? Money.Usd(_configuration.PerKgFeeUsd)
            : _fallbackPolicy.GetPerKgFee();

    public decimal GetMultiplier(ApplicationType type) =>
        _configuration is not null
            ? _configuration.GetMultiplier(type)
            : _fallbackPolicy.GetMultiplier(type);

    public string GetPolicySource() =>
        _configuration is not null
            ? $"Tenant Configuration (ID: {_configuration.Id}, Modified: {_configuration.UpdatedAt:yyyy-MM-dd})"
            : _fallbackPolicy.GetPolicySource();
}
