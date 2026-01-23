namespace FopSystem.Domain.Enums;

/// <summary>
/// Subscription tiers for aviation authorities using the FOP System platform.
/// </summary>
public enum SubscriptionTier
{
    /// <summary>
    /// Free trial tier with limited features.
    /// </summary>
    Trial = 0,

    /// <summary>
    /// Starter tier for small territories with basic needs.
    /// </summary>
    Starter = 1,

    /// <summary>
    /// Professional tier for growing territories with advanced features.
    /// </summary>
    Professional = 2,

    /// <summary>
    /// Enterprise tier for large territories with full features and dedicated support.
    /// </summary>
    Enterprise = 3
}
