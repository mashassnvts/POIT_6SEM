using DAL004;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using System.IO;

namespace ASPA005_2
{
    public class PhotoExistFilter : IEndpointFilter
    {
        public static IRepository? Repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var celebrity = context.GetArgument<Celebrity?>(0);

            if (celebrity == null)
            {
                throw new ArgumentNullException("Celebrity parameter is null");
            }

            string? photoFileName = Path.GetFileName(celebrity.PhotoPath);
            if (!File.Exists(Path.Combine("BasePath", photoFileName)))
            {
                context.HttpContext.Response.Headers.Append("X-Celebrity", $"NotFound = {photoFileName}");
            }

            return await next(context);
        }
    }
}