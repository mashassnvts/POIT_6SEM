using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace ANC25_WEBAPI_DLL
{
    public static class WebApplicationExtensions
    {
        public static void MapCelebrities(this WebApplication app)
        {
            app.MapControllerRoute(
                name: "celebrity",
                pattern: "/0",
                defaults: new { Controller = "Celebrities", Action = "NewHumanForm" });

            app.MapControllerRoute(
                name: "celebrity",
                pattern: "/{id:int:min(1)}",
                defaults: new { Controller = "Celebrities", Action = "Human" });
        }

        public static void MapLifeevents(this WebApplication app)
        {
            app.MapControllerRoute(
                name: "lifeevents",
                pattern: "lifeevents/{action=Index}/{id?}",
                defaults: new { Controller = "Lifeevents" });
        }

        public static void MapPhotoCelebrities(this WebApplication app)
        {
            app.MapControllerRoute(
                name: "photos",
                pattern: "photos/{action=Index}/{id?}",
                defaults: new { Controller = "Photos" });
        }
    }
} 