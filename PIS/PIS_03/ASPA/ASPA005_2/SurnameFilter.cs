using DAL004;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using System.IO;

namespace ASPA005_2
{
    public class SurnameFilter : IEndpointFilter
    {
        public static IRepository? Repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var celebrity = context.GetArgument<Celebrity?>(0);

            if (celebrity == null)
            {
                throw new ArgumentNullException("Celebrity parameter is null");
            }

            if (string.IsNullOrEmpty(celebrity.Surname) || celebrity.Surname.Length < 2)
            {
                throw new InvalidDataException("Surname is null or its length is less than 2");
            }

            if (Repository?.getAllCelebrities().Any(c => c.Surname == celebrity.Surname) == true)
            {
                throw new InvalidOperationException("Celebrity with the same Surname already exists");
            }

            return await next(context);
        }
    }
}