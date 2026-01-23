using FopSystem.Domain.Enums;
using FopSystem.Domain.ValueObjects;

namespace FopSystem.Domain.Services.Fees;

/// <summary>
/// Defines the fee policy for BVIAA airport fees.
/// Implementations can provide rates from different sources (database, configuration, defaults).
/// </summary>
public interface IBviaFeePolicy
{
    /// <summary>
    /// Gets the landing fee rate for the specified operation type and MTOW tier.
    /// </summary>
    /// <returns>Rate per 1000 lbs MTOW.</returns>
    Money GetLandingRate(FlightOperationType operationType, MtowTierLevel mtowTier);

    /// <summary>
    /// Gets the minimum landing fee for the specified operation type.
    /// </summary>
    Money GetMinimumLandingFee(FlightOperationType operationType);

    /// <summary>
    /// Gets the navigation/communication fee for the specified MTOW tier.
    /// </summary>
    Money GetNavigationFee(MtowTierLevel mtowTier);

    /// <summary>
    /// Gets the airport development fee rate for the specified airport.
    /// </summary>
    /// <returns>Rate per passenger.</returns>
    Money GetAirportDevelopmentFee(BviAirport airport, bool isInterisland);

    /// <summary>
    /// Gets the security charge per passenger.
    /// </summary>
    Money GetSecurityCharge();

    /// <summary>
    /// Gets the hold baggage screening fee per departing passenger.
    /// </summary>
    Money GetHoldBaggageScreeningFee();

    /// <summary>
    /// Gets the parking fee percentage of landing fee per 8-hour block.
    /// </summary>
    decimal GetParkingFeePercentage();

    /// <summary>
    /// Gets the CAT-VI fire upgrade fee.
    /// </summary>
    Money GetCatViFireUpgradeFee();

    /// <summary>
    /// Gets the flight plan filing fee.
    /// </summary>
    Money GetFlightPlanFilingFee();

    /// <summary>
    /// Gets the fuel flow fee rate per gallon.
    /// </summary>
    Money GetFuelFlowFeePerGallon();

    /// <summary>
    /// Gets the lighting fee rate per hour.
    /// </summary>
    Money GetLightingFeePerHour();

    /// <summary>
    /// Gets the late payment interest rate (monthly percentage as decimal, e.g., 0.015 for 1.5%).
    /// </summary>
    decimal GetLatePaymentInterestRate();

    /// <summary>
    /// Gets the extended operations fee for the specified time window.
    /// </summary>
    Money GetExtendedOperationsFee(int hour);

    /// <summary>
    /// Gets a description of the fee policy source for audit purposes.
    /// </summary>
    string GetPolicySource();
}
