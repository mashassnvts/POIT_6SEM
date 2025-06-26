using Microsoft.AspNetCore.Builder;
using DAL_Celebrity;
using Microsoft.AspNetCore.Http;

namespace ANC25_WEBAPI_DLL
{
    public static class ANC25Endpoints
    {
        public static void UseANC25ErrorHandler(this IApplicationBuilder app, string errorCodePrefix)
        {
            app.Use(async (context, next) =>
            {
                try
                {
                    await next();
                }
                catch (Exception ex)
                {
                    context.Response.StatusCode = 500;
                    await context.Response.WriteAsync($"{errorCodePrefix}-ERROR: {ex.Message}");
                }
            });
        }

        public static void MapANC25Endpoints(this WebApplication app)
        {
            app.MapGet("/api/celebrities", (IRepository<Celebrity, Lifeevent> repo) =>
            {
                var list = repo.GetAllCelebrities();
                return Results.Ok(list);
            });

            app.MapGet("/api/lifeevents", (IRepository<Celebrity, Lifeevent> repo) =>
            {
                var list = repo.GetAllLifeevents();
                return Results.Ok(list);
            });

            app.MapGet("/api/photos/{id}", (int id, IRepository<Celebrity, Lifeevent> repo) =>
            {
                var celeb = repo.GetCelebrityById(id);
                return celeb?.ReqPhotoPath != null
                    ? Results.File(celeb.ReqPhotoPath, "image/jpeg")
                    : Results.NotFound();
            });
        }
    }
} 