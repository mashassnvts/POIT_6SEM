using DAL004;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;

namespace ASPA005_2
{
    public class DeleteCelebrityFilter : IEndpointFilter
    {
        public static IRepository? Repository { get; set; }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var id = context.GetArgument<int>(0);

            if (Repository?.getCelebrityById(id) == null)
            {
                throw new FoundByIdException($"Celebrity Id = {id} not found for delete");
            }

            return await next(context);
        }
    }
}