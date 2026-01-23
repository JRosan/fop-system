using FopSystem.Domain.Entities;
using FopSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FopSystem.Api.Endpoints;

public static class DeviceEndpoints
{
    public static void MapDeviceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/devices")
            .WithTags("Devices")
            .RequireAuthorization();

        group.MapPost("/register", RegisterDevice)
            .WithName("RegisterDevice")
            .WithDescription("Register a device for push notifications");

        group.MapDelete("/{token}", UnregisterDevice)
            .WithName("UnregisterDevice")
            .WithDescription("Unregister a device from push notifications");

        group.MapGet("/", GetUserDevices)
            .WithName("GetUserDevices")
            .WithDescription("Get all registered devices for the current user");
    }

    public record RegisterDeviceRequest(
        string Token,
        string Platform,
        string? DeviceId
    );

    public record DeviceResponse(
        Guid Id,
        string Token,
        string Platform,
        string? DeviceId,
        DateTime RegisteredAt,
        DateTime? LastUsedAt,
        bool IsActive
    );

    private static async Task<IResult> RegisterDevice(
        [FromBody] RegisterDeviceRequest request,
        FopDbContext db,
        HttpContext httpContext,
        CancellationToken ct)
    {
        // Get current user ID from claims
        var userIdClaim = httpContext.User.FindFirst("sub")?.Value
            ?? httpContext.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        // Get tenant ID from claims
        var tenantIdClaim = httpContext.User.FindFirst("tenant_id")?.Value;
        var tenantId = !string.IsNullOrEmpty(tenantIdClaim) && Guid.TryParse(tenantIdClaim, out var tid)
            ? tid
            : Guid.Empty;

        // Check if token already exists for this user
        var existingToken = await db.Set<DeviceToken>()
            .FirstOrDefaultAsync(d => d.Token == request.Token && d.UserId == userId, ct);

        if (existingToken != null)
        {
            // Reactivate if deactivated, otherwise just update last used
            if (!existingToken.IsActive)
            {
                existingToken.Reactivate(request.Token);
            }
            existingToken.UpdateLastUsed();
            await db.SaveChangesAsync(ct);

            return Results.Ok(new DeviceResponse(
                existingToken.Id,
                existingToken.Token,
                existingToken.Platform,
                existingToken.DeviceId,
                existingToken.RegisteredAt,
                existingToken.LastUsedAt,
                existingToken.IsActive
            ));
        }

        // Check if this device ID already has a token registered
        if (!string.IsNullOrEmpty(request.DeviceId))
        {
            var existingDevice = await db.Set<DeviceToken>()
                .FirstOrDefaultAsync(d => d.DeviceId == request.DeviceId && d.UserId == userId, ct);

            if (existingDevice != null)
            {
                // Update the token for this device
                existingDevice.Reactivate(request.Token);
                existingDevice.UpdateLastUsed();
                await db.SaveChangesAsync(ct);

                return Results.Ok(new DeviceResponse(
                    existingDevice.Id,
                    existingDevice.Token,
                    existingDevice.Platform,
                    existingDevice.DeviceId,
                    existingDevice.RegisteredAt,
                    existingDevice.LastUsedAt,
                    existingDevice.IsActive
                ));
            }
        }

        // Create new device registration
        var deviceToken = DeviceToken.Create(
            userId,
            request.Token,
            request.Platform,
            request.DeviceId,
            tenantId
        );

        db.Set<DeviceToken>().Add(deviceToken);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/devices/{deviceToken.Token}", new DeviceResponse(
            deviceToken.Id,
            deviceToken.Token,
            deviceToken.Platform,
            deviceToken.DeviceId,
            deviceToken.RegisteredAt,
            deviceToken.LastUsedAt,
            deviceToken.IsActive
        ));
    }

    private static async Task<IResult> UnregisterDevice(
        string token,
        FopDbContext db,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var userIdClaim = httpContext.User.FindFirst("sub")?.Value
            ?? httpContext.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var decodedToken = Uri.UnescapeDataString(token);
        var deviceToken = await db.Set<DeviceToken>()
            .FirstOrDefaultAsync(d => d.Token == decodedToken && d.UserId == userId, ct);

        if (deviceToken == null)
        {
            return Results.NotFound();
        }

        deviceToken.Deactivate();
        await db.SaveChangesAsync(ct);

        return Results.NoContent();
    }

    private static async Task<IResult> GetUserDevices(
        FopDbContext db,
        HttpContext httpContext,
        CancellationToken ct)
    {
        var userIdClaim = httpContext.User.FindFirst("sub")?.Value
            ?? httpContext.User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Results.Unauthorized();
        }

        var devices = await db.Set<DeviceToken>()
            .Where(d => d.UserId == userId && d.IsActive)
            .OrderByDescending(d => d.RegisteredAt)
            .Select(d => new DeviceResponse(
                d.Id,
                d.Token,
                d.Platform,
                d.DeviceId,
                d.RegisteredAt,
                d.LastUsedAt,
                d.IsActive
            ))
            .ToListAsync(ct);

        return Results.Ok(devices);
    }
}
