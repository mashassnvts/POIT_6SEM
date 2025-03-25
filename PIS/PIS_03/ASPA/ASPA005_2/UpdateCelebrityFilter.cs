using DAL004;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;

namespace ASPA005_2
{
    public class UpdateCelebrityFilter : IEndpointFilter
    {
        public static IRepository? Repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var id = context.GetArgument<int>(0);
            var celebrity = context.GetArgument<Celebrity?>(1);

            if (celebrity == null)
            {
                throw new ArgumentNullException("Celebrity parameter is null");
            }

            if (Repository?.getCelebrityById(id) == null)
            {
                throw new FoundByIdException($"Celebrity Id = {id} not found for update");
            }

            return await next(context);
        }
    }
}