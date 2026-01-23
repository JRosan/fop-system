namespace FopSystem.Infrastructure.Caching;

/// <summary>
/// Centralized cache key definitions for consistency.
/// </summary>
public static class CacheKeys
{
    private const string Prefix = "fop:";

    // Fee configuration keys
    public static string FeeConfiguration(Guid tenantId) => $"{Prefix}tenant:{tenantId}:fees";
    public static string FeeRates(Guid tenantId) => $"{Prefix}tenant:{tenantId}:fee-rates";

    // Subscription plan keys
    public static string SubscriptionPlans() => $"{Prefix}subscription-plans";
    public static string TenantSubscription(Guid tenantId) => $"{Prefix}tenant:{tenantId}:subscription";

    // Dashboard metrics keys
    public static string DashboardMetrics(Guid tenantId, string type) => $"{Prefix}tenant:{tenantId}:dashboard:{type}";

    // Application keys
    public static string Application(Guid id) => $"{Prefix}application:{id}";
    public static string ApplicationList(Guid tenantId, int page, int pageSize, string? status = null) =>
        $"{Prefix}tenant:{tenantId}:applications:list:{page}:{pageSize}:{status ?? "all"}";

    // Permit keys
    public static string Permit(Guid id) => $"{Prefix}permit:{id}";
    public static string PermitByNumber(string permitNumber) => $"{Prefix}permit:number:{permitNumber}";
    public static string PermitList(Guid tenantId) => $"{Prefix}tenant:{tenantId}:permits:list";

    // Operator keys
    public static string Operator(Guid id) => $"{Prefix}operator:{id}";
    public static string OperatorList(Guid tenantId) => $"{Prefix}tenant:{tenantId}:operators:list";

    // User keys
    public static string User(Guid id) => $"{Prefix}user:{id}";
    public static string UserList(Guid tenantId) => $"{Prefix}tenant:{tenantId}:users:list";

    // Patterns for invalidation
    public static class Patterns
    {
        public static string AllTenant(Guid tenantId) => $"{Prefix}tenant:{tenantId}:*";
        public static string AllApplications(Guid tenantId) => $"{Prefix}tenant:{tenantId}:applications:*";
        public static string AllPermits(Guid tenantId) => $"{Prefix}tenant:{tenantId}:permits:*";
        public static string AllDashboards(Guid tenantId) => $"{Prefix}tenant:{tenantId}:dashboard:*";
    }
}
