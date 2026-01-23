namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// Provides fee policies for the current tenant context.
/// </summary>
public interface IFeePolicyProvider
{
    /// <summary>
    /// Gets the FOP permit fee policy for the current tenant.
    /// </summary>
    Task<IFopFeePolicy> GetFopFeePolicyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the BVIA airport fee policy for the current tenant.
    /// </summary>
    /// <param name="effectiveDate">The date for which rates should be effective.</param>
    Task<IBviaFeePolicy> GetBviaFeePolicyAsync(DateOnly? effectiveDate = null, CancellationToken cancellationToken = default);
}
