using FluentValidation;
using FopSystem.Application.Behaviors;
using FopSystem.Domain.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FopSystem.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);
            config.AddOpenBehavior(typeof(LoggingBehavior<,>));
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        services.AddScoped<IFeeCalculationService, FeeCalculationService>();

        return services;
    }
}
