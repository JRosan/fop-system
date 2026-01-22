namespace FopSystem.Domain.ValueObjects;

public sealed class OperatingWindow : ValueObject
{
    private static readonly TimeOnly StandardOpenTime = new(6, 0);    // 06:00 local
    private static readonly TimeOnly StandardCloseTime = new(22, 0);  // 22:00 local
    private static readonly TimeOnly LightingStartTime = new(23, 0);  // 23:00 GMT
    private static readonly TimeOnly LightingEndTime = new(2, 0);     // 02:00 GMT

    public TimeOnly ScheduledArrivalTime { get; }
    public TimeOnly ScheduledDepartureTime { get; }
    public bool RequiresExtendedOperations { get; }
    public bool RequiresLighting { get; }
    public int LightingHours { get; }

    private OperatingWindow(
        TimeOnly scheduledArrivalTime,
        TimeOnly scheduledDepartureTime,
        bool requiresExtendedOperations,
        bool requiresLighting,
        int lightingHours)
    {
        ScheduledArrivalTime = scheduledArrivalTime;
        ScheduledDepartureTime = scheduledDepartureTime;
        RequiresExtendedOperations = requiresExtendedOperations;
        RequiresLighting = requiresLighting;
        LightingHours = lightingHours;
    }

    public static OperatingWindow Create(TimeOnly arrivalTime, TimeOnly departureTime)
    {
        var requiresExtended = IsOutsideStandardHours(arrivalTime) || IsOutsideStandardHours(departureTime);
        var (requiresLighting, lightingHours) = CalculateLightingRequirement(arrivalTime, departureTime);

        return new OperatingWindow(
            arrivalTime,
            departureTime,
            requiresExtended,
            requiresLighting,
            lightingHours);
    }

    public static OperatingWindow CreateWithArrivalOnly(TimeOnly arrivalTime)
    {
        return Create(arrivalTime, arrivalTime.AddHours(1));
    }

    public static OperatingWindow StandardHours()
    {
        return Create(new TimeOnly(10, 0), new TimeOnly(12, 0));
    }

    private static bool IsOutsideStandardHours(TimeOnly time)
    {
        return time < StandardOpenTime || time > StandardCloseTime;
    }

    private static (bool RequiresLighting, int Hours) CalculateLightingRequirement(
        TimeOnly arrivalTime,
        TimeOnly departureTime)
    {
        var lightingRequired = false;
        var totalHours = 0;

        if (IsInLightingPeriod(arrivalTime))
        {
            lightingRequired = true;
            totalHours++;
        }

        if (IsInLightingPeriod(departureTime) && departureTime != arrivalTime)
        {
            lightingRequired = true;
            totalHours++;
        }

        return (lightingRequired, totalHours);
    }

    private static bool IsInLightingPeriod(TimeOnly time)
    {
        // Lighting period spans midnight: 23:00 to 02:00
        return time >= LightingStartTime || time <= LightingEndTime;
    }

    public bool IsEarlyOperation => ScheduledArrivalTime < StandardOpenTime;

    public bool IsLateOperation => ScheduledDepartureTime > StandardCloseTime;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return ScheduledArrivalTime;
        yield return ScheduledDepartureTime;
    }

    public override string ToString()
    {
        var flags = new List<string>();
        if (RequiresExtendedOperations) flags.Add("Extended");
        if (RequiresLighting) flags.Add($"Lighting({LightingHours}h)");

        var flagStr = flags.Count > 0 ? $" [{string.Join(", ", flags)}]" : "";
        return $"{ScheduledArrivalTime:HH:mm}-{ScheduledDepartureTime:HH:mm}{flagStr}";
    }
}
