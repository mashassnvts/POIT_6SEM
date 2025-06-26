using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using Microsoft.Data.SqlClient;

namespace ASP006_1
{
    public class Routes
    {
        public Routes(WebApplication app)
        {
            Init(app);
        }

        private void Init(WebApplication app)
        {
            var celebrities = app.MapGroup("/api/Celebrities");

            celebrities.MapGet("/", (ICelebrityService service) =>
                Results.Ok(service.GetAllCelebrities()));

            celebrities.MapGet("/{id:int:min(1)}", (ICelebrityService service, int id) =>
                service.GetCelebrityById(id) is Celebrity celebrity
                    ? Results.Ok(celebrity)
                    : Results.NotFound());

            celebrities.MapGet("/Lifeevents/{id:int:min(1)}", (ICelebrityService service, int id) =>
                service.GetCelebrityByLifeeventId(id) is Celebrity celebrity
                    ? Results.Ok(celebrity)
                    : Results.NotFound());

            celebrities.MapDelete("/{id:int:min(1)}", (ICelebrityService service, int id) =>
                service.DeleteCelebrity(id)
                    ? Results.NoContent()
                    : Results.NotFound());

            celebrities.MapPost("/", (ICelebrityService service, Celebrity celebrity) =>
            {
                if (celebrity == null) return Results.BadRequest();
                var id = service.CreateCelebrity(celebrity);
                return id > 0
                    ? Results.Created($"/api/Celebrities/{id}", celebrity)
                    : Results.BadRequest();
            });

            celebrities.MapPut("/{id:int:min(1)}", (ICelebrityService service, int id, Celebrity celebrity) =>
                service.UpdateCelebrity(id, celebrity)
                    ? Results.NoContent()
                    : Results.NotFound());

            celebrities.MapGet("/photo/{fname}", async (ICelebrityService service, string fname) =>
            {
                var stream = await service.GetCelebrityPhotoAsync(fname);
                return stream is not null
                    ? Results.File(stream, "image/jpeg")
                    : Results.NotFound();
            });

            var lifeevents = app.MapGroup("/api/Lifeevents");

            lifeevents.MapGet("/", (ICelebrityService service) =>
                Results.Ok(service.GetAllLifeevents()));

            lifeevents.MapGet("/{id:int:min(1)}", (ICelebrityService service, int id) =>
                service.GetLifeeventById(id) is Lifeevent lifeevent
                    ? Results.Ok(lifeevent)
                    : Results.NotFound());

            lifeevents.MapGet("/Celebrities/{id:int:min(1)}", (ICelebrityService service, int id) =>
                Results.Ok(service.GetLifeeventsByCelebrityId(id)));

            lifeevents.MapDelete("/{id:int:min(1)}", (ICelebrityService service, int id) =>
                service.DeleteLifeevent(id)
                    ? Results.NoContent()
                    : Results.NotFound());

            lifeevents.MapPost("/", (ICelebrityService service, Lifeevent lifeevent) =>
            {
                if (lifeevent == null) return Results.BadRequest();
                var id = service.CreateLifeevent(lifeevent);
                return id > 0
                    ? Results.Created($"/api/Lifeevents/{id}", lifeevent)
                    : Results.BadRequest();
            });

            lifeevents.MapPut("/{id:int:min(1)}", (ICelebrityService service, int id, Lifeevent lifeevent) =>
                service.UpdateLifeevent(id, lifeevent)
                    ? Results.NoContent()
                    : Results.NotFound());

            app.MapGet("/", async context =>
            {
                context.Response.ContentType = "text/html";
                await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "index.html"));
            });
            
            app.MapGet("/celeb/{id:int:min(1)}", async context =>
            {
                context.Response.ContentType = "text/html";
                await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath, "celeb.html"));
            });
        }
    }
}
