namespace FopSystem.Domain.ValueObjects;

/// <summary>
/// Represents a geographic coordinate with latitude, longitude, and optional altitude and accuracy.
/// Used for tracking field operations locations.
/// </summary>
public sealed class GeoCoordinate : ValueObject
{
    public double Latitude { get; }
    public double Longitude { get; }
    public double? Altitude { get; }
    public double? Accuracy { get; }

    private GeoCoordinate(double latitude, double longitude, double? altitude, double? accuracy)
    {
        Latitude = latitude;
        Longitude = longitude;
        Altitude = altitude;
        Accuracy = accuracy;
    }

    public static GeoCoordinate Create(
        double latitude,
        double longitude,
        double? altitude = null,
        double? accuracy = null)
    {
        if (latitude < -90 || latitude > 90)
            throw new ArgumentException("Latitude must be between -90 and 90 degrees", nameof(latitude));

        if (longitude < -180 || longitude > 180)
            throw new ArgumentException("Longitude must be between -180 and 180 degrees", nameof(longitude));

        if (accuracy.HasValue && accuracy.Value < 0)
            throw new ArgumentException("Accuracy cannot be negative", nameof(accuracy));

        return new GeoCoordinate(latitude, longitude, altitude, accuracy);
    }

    /// <summary>
    /// Creates a coordinate for TB Lettsome International Airport (TUPJ / Beef Island).
    /// </summary>
    public static GeoCoordinate TbLettsomeAirport() =>
        Create(18.4446, -64.5433, altitude: 4.57);

    /// <summary>
    /// Creates a coordinate for Taddy Bay Airport (TUPW / Virgin Gorda).
    /// </summary>
    public static GeoCoordinate TaddyBayAirport() =>
        Create(18.4504, -64.4267, altitude: 3.0);

    /// <summary>
    /// Creates a coordinate for Auguste George Airport (TUPY / Anegada).
    /// </summary>
    public static GeoCoordinate AugusteGeorgeAirport() =>
        Create(18.7279, -64.3297, altitude: 3.05);

    /// <summary>
    /// Calculates the distance in meters between two coordinates using the Haversine formula.
    /// </summary>
    public double DistanceTo(GeoCoordinate other)
    {
        const double EarthRadiusMeters = 6371000;

        var lat1 = ToRadians(Latitude);
        var lat2 = ToRadians(other.Latitude);
        var deltaLat = ToRadians(other.Latitude - Latitude);
        var deltaLon = ToRadians(other.Longitude - Longitude);

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusMeters * c;
    }

    /// <summary>
    /// Checks if this coordinate is within a specified radius (in meters) of another coordinate.
    /// </summary>
    public bool IsWithinRadius(GeoCoordinate other, double radiusMeters) =>
        DistanceTo(other) <= radiusMeters;

    private static double ToRadians(double degrees) => degrees * (Math.PI / 180);

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Math.Round(Latitude, 6);
        yield return Math.Round(Longitude, 6);
        yield return Altitude.HasValue ? Math.Round(Altitude.Value, 2) : null;
        yield return Accuracy.HasValue ? Math.Round(Accuracy.Value, 2) : null;
    }

    public override string ToString() =>
        Altitude.HasValue
            ? $"({Latitude:F6}, {Longitude:F6}, {Altitude:F2}m)"
            : $"({Latitude:F6}, {Longitude:F6})";
}
