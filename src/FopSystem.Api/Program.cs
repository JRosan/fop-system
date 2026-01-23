using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FopSystem.Api.Endpoints;
using FopSystem.Api.Middleware;
using FopSystem.Application;
using FopSystem.Infrastructure;
using FopSystem.Infrastructure.Persistence;
using FopSystem.Infrastructure.Persistence.Seeders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization to use string enums
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// Add services to the container
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Authentication with Microsoft Entra ID
if (builder.Configuration.GetSection("AzureAd").Exists())
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

    builder.Services.AddAuthorizationBuilder()
        .AddPolicy("Applicant", policy => policy.RequireRole("Applicant", "Admin", "SuperAdmin"))
        .AddPolicy("Reviewer", policy => policy.RequireRole("Reviewer", "Approver", "Admin", "SuperAdmin"))
        .AddPolicy("Approver", policy => policy.RequireRole("Approver", "Admin", "SuperAdmin"))
        .AddPolicy("FinanceOfficer", policy => policy.RequireRole("FinanceOfficer", "Admin", "SuperAdmin"))
        .AddPolicy("Finance", policy => policy.RequireRole("FinanceOfficer", "Admin", "SuperAdmin"))
        .AddPolicy("Admin", policy => policy.RequireRole("Admin", "SuperAdmin"))
        .AddPolicy("SuperAdmin", policy => policy.RequireRole("SuperAdmin"))
        .AddPolicy("FieldOfficer", policy => policy.RequireRole("FieldOfficer", "Reviewer", "Approver", "Admin", "SuperAdmin"));
}
else
{
    // Development mode without authentication - allow anonymous access
    builder.Services.AddAuthentication().AddJwtBearer();

    // Define same policies that allow anonymous access for development testing
    // Also set the default policy to allow anonymous access
    builder.Services.AddAuthorizationBuilder()
        .SetDefaultPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
            .RequireAssertion(_ => true)
            .Build())
        .AddPolicy("Applicant", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("Reviewer", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("Approver", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("FinanceOfficer", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("Finance", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("Admin", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("SuperAdmin", policy => policy.RequireAssertion(_ => true))
        .AddPolicy("FieldOfficer", policy => policy.RequireAssertion(_ => true));
}

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "http://localhost:8081"];

        policy.WithOrigins(origins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 10,
                Window = TimeSpan.FromMinutes(1)
            }));

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            error = "Too many requests. Please try again later."
        }, token);
    };
});

// OpenAPI
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "BVI Foreign Operator Permit (FOP) System API";
        document.Info.Version = "v1";
        document.Info.Description = "API for managing Foreign Operator Permit applications for the British Virgin Islands Civil Aviation Department";
        document.Info.Contact = new()
        {
            Name = "BVI Civil Aviation Department",
            Email = "info@bvicad.gov.vg"
        };
        return Task.CompletedTask;
    });
});

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<FopDbContext>("database");

// Problem details
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("BVI FOP System API")
            .WithTheme(ScalarTheme.BluePlanet)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });

    // Auto-migrate in development
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<FopDbContext>();
    try
    {
        await db.Database.MigrateAsync();

        // Seed default tenant first (required for multi-tenancy)
        var tenantSeeder = scope.ServiceProvider.GetRequiredService<TenantSeeder>();
        await tenantSeeder.SeedAsync();

        // Seed subscription plans
        var subscriptionSeeder = scope.ServiceProvider.GetRequiredService<SubscriptionPlanSeeder>();
        await subscriptionSeeder.SeedAsync();

        // Seed BVIAA fee rates
        var feeSeeder = scope.ServiceProvider.GetRequiredService<BviaFeeRateSeeder>();
        await feeSeeder.SeedAsync();

        // Seed sample data (operators, applications, permits)
        var sampleSeeder = scope.ServiceProvider.GetRequiredService<SampleDataSeeder>();
        await sampleSeeder.SeedAsync();
    }
    catch (Exception ex)
    {
        // Log seeding errors in development
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error during database migration/seeding");
    }
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Tenant resolution middleware (after auth, before endpoints)
app.UseTenantResolution();

// Health check endpoint
app.MapHealthChecks("/health");

// Map API endpoints
app.MapApplicationEndpoints();
app.MapOperatorEndpoints();
app.MapAircraftEndpoints();
app.MapDocumentEndpoints();
app.MapPaymentEndpoints();
app.MapPermitEndpoints();
app.MapFeeEndpoints();
app.MapFinanceEndpoints();
app.MapWaiverEndpoints();
app.MapUserEndpoints();
app.MapAuditEndpoints();
app.MapFeeConfigurationEndpoints();
app.MapDashboardEndpoints();
app.MapBviaRevenueEndpoints();
app.MapTenantEndpoints();
app.MapSubscriptionEndpoints();
app.MapStripeEndpoints();
app.MapAuthEndpoints();
app.MapDeviceEndpoints();
app.MapFieldOperationsEndpoints();

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
