using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ASafariM.Shared.Validation.DependencyInjection;

public static class ValidationServiceCollectionExtensions
{
    public static IServiceCollection AddSharedValidators(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        return services;
    }
}
