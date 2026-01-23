using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// Defines the fee policy for FOP permit applications.
/// Implementations can provide rates from different sources (database, configuration, defaults).
/// </summary>
public interface IFopFeePolicy
{
    /// <summary>
    /// Gets the base fee for permit applications.
    /// </summary>
    Money GetBaseFee();

    /// <summary>
    /// Gets the per-seat fee rate.
    /// </summary>
    Money GetPerSeatFee();

    /// <summary>
    /// Gets the per-kilogram fee rate.
    /// </summary>
    Money GetPerKgFee();

    /// <summary>
    /// Gets the multiplier for the specified application type.
    /// </summary>
    decimal GetMultiplier(ApplicationType type);

    /// <summary>
    /// Gets a description of the fee policy source for audit purposes.
    /// </summary>
    string GetPolicySource();
}
