using System.Threading.RateLimiting;
using FopSystem.Api.Endpoints;
using FopSystem.Application;
using FopSystem.Infrastructure;
using FopSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

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
        .AddPolicy("Applicant", policy => policy.RequireRole("Applicant", "Admin"))
        .AddPolicy("Reviewer", policy => policy.RequireRole("Reviewer", "Approver", "Admin"))
        .AddPolicy("Approver", policy => policy.RequireRole("Approver", "Admin"))
        .AddPolicy("FinanceOfficer", policy => policy.RequireRole("FinanceOfficer", "Admin"))
        .AddPolicy("Admin", policy => policy.RequireRole("Admin"));
}
else
{
    // Development mode without authentication
    builder.Services.AddAuthentication().AddJwtBearer();
    builder.Services.AddAuthorization();
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
    }
    catch (Exception)
    {
        // Ignore migration errors (e.g., when using in-memory database for tests)
    }
}

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseCors("AllowFrontend");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

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

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
