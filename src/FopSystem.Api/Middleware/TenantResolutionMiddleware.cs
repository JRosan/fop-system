using FopSystem.Domain.Repositories;
using FopSystem.Domain.Services;

namespace FopSystem.Api.Middleware;

/// <summary>
/// Middleware that resolves the current tenant from the request.
/// Resolution order:
/// 1. X-Tenant-Id header (API clients)
/// 2. X-Tenant-Code header (alternative for API clients)
/// 3. Subdomain extraction (web apps)
/// 4. JWT claim "tenant_id" (authenticated users)
/// </summary>
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantResolutionMiddleware> _logger;

    // Paths that don't require tenant resolution
    private static readonly string[] TenantFreeEndpoints = new[]
    {
        "/health",
        "/scalar",
        "/openapi",
        "/api/tenants", // Tenant management endpoints (SuperAdmin)
        "/.well-known"
    };

    public TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context,
        ITenantContext tenantContext,
        ITenantRepository tenantRepository)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Skip tenant resolution for tenant-free endpoints
        if (IsTenantFreeEndpoint(path))
        {
            await _next(context);
            return;
        }

        var tenant = await ResolveTenantAsync(context, tenantRepository);

        if (tenant is null)
        {
            _logger.LogWarning(
                "Unable to resolve tenant for request {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                title = "Tenant Required",
                status = 400,
                detail = "Unable to determine the tenant for this request. " +
                         "Please provide a valid X-Tenant-Id header, X-Tenant-Code header, " +
                         "or access via the appropriate subdomain."
            });
            return;
        }

        if (!tenant.IsActive)
        {
            _logger.LogWarning(
                "Request attempted for inactive tenant {TenantCode} ({TenantId})",
                tenant.Code,
                tenant.Id);

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
                title = "Tenant Inactive",
                status = 403,
                detail = "This tenant is currently inactive. Please contact support."
            });
            return;
        }

        tenantContext.SetTenant(tenant.Id, tenant.Code);

        _logger.LogDebug(
            "Resolved tenant {TenantCode} ({TenantId}) for request {Method} {Path}",
            tenant.Code,
            tenant.Id,
            context.Request.Method,
            context.Request.Path);

        await _next(context);
    }

    private static bool IsTenantFreeEndpoint(string path)
    {
        return TenantFreeEndpoints.Any(endpoint =>
            path.StartsWith(endpoint, StringComparison.OrdinalIgnoreCase));
    }

    private async Task<Domain.Entities.Tenant?> ResolveTenantAsync(
        HttpContext context,
        ITenantRepository tenantRepository)
    {
        // 1. Try X-Tenant-Id header
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
        {
            if (Guid.TryParse(tenantIdHeader.FirstOrDefault(), out var tenantId))
            {
                var tenant = await tenantRepository.GetByIdAsync(tenantId);
                if (tenant is not null)
                {
                    _logger.LogDebug("Resolved tenant from X-Tenant-Id header: {TenantId}", tenantId);
                    return tenant;
                }
            }
        }

        // 2. Try X-Tenant-Code header
        if (context.Request.Headers.TryGetValue("X-Tenant-Code", out var tenantCodeHeader))
        {
            var tenantCode = tenantCodeHeader.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(tenantCode))
            {
                var tenant = await tenantRepository.GetByCodeAsync(tenantCode);
                if (tenant is not null)
                {
                    _logger.LogDebug("Resolved tenant from X-Tenant-Code header: {TenantCode}", tenantCode);
                    return tenant;
                }
            }
        }

        // 3. Try subdomain extraction
        var host = context.Request.Host.Host;
        var subdomain = ExtractSubdomain(host);
        if (!string.IsNullOrWhiteSpace(subdomain))
        {
            var tenant = await tenantRepository.GetBySubdomainAsync(subdomain);
            if (tenant is not null)
            {
                _logger.LogDebug("Resolved tenant from subdomain: {Subdomain}", subdomain);
                return tenant;
            }
        }

        // 4. Try JWT claim
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantIdClaim = context.User.FindFirst("tenant_id")?.Value;
            if (!string.IsNullOrWhiteSpace(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var claimTenantId))
            {
                var tenant = await tenantRepository.GetByIdAsync(claimTenantId);
                if (tenant is not null)
                {
                    _logger.LogDebug("Resolved tenant from JWT tenant_id claim: {TenantId}", claimTenantId);
                    return tenant;
                }
            }
        }

        return null;
    }

    private static string? ExtractSubdomain(string host)
    {
        // Remove port if present
        var hostWithoutPort = host.Split(':')[0];

        // Skip localhost and IP addresses
        if (hostWithoutPort.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
            System.Net.IPAddress.TryParse(hostWithoutPort, out _))
        {
            return null;
        }

        var parts = hostWithoutPort.Split('.');

        // Need at least 3 parts for subdomain (e.g., bvi.fopsystem.com)
        if (parts.Length >= 3)
        {
            // Return the first part as subdomain
            // Skip common non-tenant subdomains
            var subdomain = parts[0].ToLowerInvariant();
            if (subdomain != "www" && subdomain != "api" && subdomain != "app")
            {
                return subdomain;
            }
        }

        return null;
    }
}

/// <summary>
/// Extension methods for TenantResolutionMiddleware registration.
/// </summary>
public static class TenantResolutionMiddlewareExtensions
{
    /// <summary>
    /// Adds the tenant resolution middleware to the application pipeline.
    /// This should be added after authentication but before authorization.
    /// </summary>
    public static IApplicationBuilder UseTenantResolution(this IApplicationBuilder app)
    {
        return app.UseMiddleware<TenantResolutionMiddleware>();
    }
}
