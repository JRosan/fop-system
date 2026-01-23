using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;
using FopSystem.Domain.Services.Fees;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.Services;

/// <summary>
/// Provides fee policies for the current tenant by loading rates from the database.
/// Falls back to default policies when tenant-specific configuration is not available.
/// </summary>
public class FeePolicyProvider : IFeePolicyProvider
{
    private readonly IFeeConfigurationRepository _feeConfigurationRepository;
    private readonly IBviaFeeRateRepository _bviaFeeRateRepository;
    private readonly ITenantContext _tenantContext;
    private readonly ILogger<FeePolicyProvider> _logger;

    public FeePolicyProvider(
        IFeeConfigurationRepository feeConfigurationRepository,
        IBviaFeeRateRepository bviaFeeRateRepository,
        ITenantContext tenantContext,
        ILogger<FeePolicyProvider> logger)
    {
        _feeConfigurationRepository = feeConfigurationRepository;
        _bviaFeeRateRepository = bviaFeeRateRepository;
        _tenantContext = tenantContext;
        _logger = logger;
    }

    public async Task<IFopFeePolicy> GetFopFeePolicyAsync(CancellationToken cancellationToken = default)
    {
        if (!_tenantContext.HasTenant)
        {
            _logger.LogDebug("No tenant context, using default FOP fee policy");
            return new DefaultFopFeePolicy();
        }

        try
        {
            var configuration = await _feeConfigurationRepository.GetActiveAsync(cancellationToken);

            if (configuration is null)
            {
                _logger.LogDebug(
                    "No active fee configuration found for tenant {TenantCode}, using default policy",
                    _tenantContext.TenantCode);
                return new DefaultFopFeePolicy();
            }

            _logger.LogDebug(
                "Using database fee configuration {ConfigId} for tenant {TenantCode}",
                configuration.Id,
                _tenantContext.TenantCode);

            return new DatabaseFopFeePolicy(configuration);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Error loading fee configuration for tenant {TenantCode}, falling back to default policy",
                _tenantContext.TenantCode);
            return new DefaultFopFeePolicy();
        }
    }

    public async Task<IBviaFeePolicy> GetBviaFeePolicyAsync(
        DateOnly? effectiveDate = null,
        CancellationToken cancellationToken = default)
    {
        var date = effectiveDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        if (!_tenantContext.HasTenant)
        {
            _logger.LogDebug("No tenant context, using default BVIA fee policy");
            return new DefaultBviaFeePolicy();
        }

        try
        {
            var rates = await _bviaFeeRateRepository.GetActiveRatesAsync(date, cancellationToken);

            if (rates.Count == 0)
            {
                _logger.LogDebug(
                    "No active BVIA fee rates found for tenant {TenantCode} on {EffectiveDate}, using default policy",
                    _tenantContext.TenantCode,
                    date);
                return new DefaultBviaFeePolicy();
            }

            _logger.LogDebug(
                "Using {RateCount} database fee rates for tenant {TenantCode} effective {EffectiveDate}",
                rates.Count,
                _tenantContext.TenantCode,
                date);

            return new DatabaseBviaFeePolicy(rates, date);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Error loading BVIA fee rates for tenant {TenantCode}, falling back to default policy",
                _tenantContext.TenantCode);
            return new DefaultBviaFeePolicy();
        }
    }
}
