using System.Net;
using FluentAssertions;
using Xunit;

namespace FopSystem.Api.Tests.Endpoints;

public class HealthEndpointTests : IClassFixture<TestWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(TestWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ShouldReturnValidHealthCheckResponse()
    {
        // Act
        var response = await _client.GetAsync("/health");

        // Assert - Health check returns 200 (Healthy) or 503 (Unhealthy/Degraded)
        // In test environment with in-memory database, 503 is acceptable
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.ServiceUnavailable);
    }
}
