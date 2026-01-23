using MediatR;
using Microsoft.Extensions.Logging;

namespace FopSystem.Application.Behaviors;

/// <summary>
/// Marker interface for queries that should be cached.
/// </summary>
public interface ICachedQuery
{
    /// <summary>
    /// The cache key for this query.
    /// </summary>
    string CacheKey { get; }

    /// <summary>
    /// Optional cache duration. Defaults to 5 minutes if not specified.
    /// </summary>
    TimeSpan? CacheDuration { get; }
}

/// <summary>
/// Cache service interface for the caching behavior.
/// Implement this with your preferred caching provider (Memory, Redis, etc.)
/// </summary>
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
}

/// <summary>
/// MediatR pipeline behavior that caches query results.
/// Only applies to queries that implement ICachedQuery.
/// </summary>
/// <typeparam name="TRequest">The request type.</typeparam>
/// <typeparam name="TResponse">The response type.</typeparam>
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ICacheService? _cacheService;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

    public CachingBehavior(
        ILogger<CachingBehavior<TRequest, TResponse>> logger,
        ICacheService? cacheService = null)
    {
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Only cache queries that implement ICachedQuery
        if (request is not ICachedQuery cachedQuery || _cacheService == null)
        {
            return await next();
        }

        var cacheKey = cachedQuery.CacheKey;

        // Try to get from cache
        var cachedResponse = await _cacheService.GetAsync<TResponse>(cacheKey, cancellationToken);
        if (cachedResponse != null)
        {
            _logger.LogDebug(
                "Cache hit for {RequestType} with key {CacheKey}",
                typeof(TRequest).Name,
                cacheKey);

            return cachedResponse;
        }

        // Execute handler
        _logger.LogDebug(
            "Cache miss for {RequestType} with key {CacheKey}, executing handler",
            typeof(TRequest).Name,
            cacheKey);

        var response = await next();

        // Cache the response
        if (response != null)
        {
            var duration = cachedQuery.CacheDuration ?? TimeSpan.FromMinutes(5);
            await _cacheService.SetAsync(cacheKey, response, duration, cancellationToken);

            _logger.LogDebug(
                "Cached response for {RequestType} with key {CacheKey}, duration {Duration}",
                typeof(TRequest).Name,
                cacheKey,
                duration);
        }

        return response;
    }
}
