using ASPA006_1;
using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddJsonFile("Celebrities.config.json", optional: false, reloadOnChange: true);
builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("CelebritiesConfig"));

builder.Services.AddDbContext<CelebrityContext>(options =>
    options.UseSqlServer(builder.Configuration["CelebritiesConfig:ConnectionString"],
        sqlServerOptions => sqlServerOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<IRepository<Celebrity, Lifeevent>>(sp =>
{
    var config = sp.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
    return new CelebrityRepository(config.ConnectionString);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseDefaultFiles();
app.UseCors("AllowAll");
app.UseAuthorization();

app.UseMiddleware<ExceptionManagerMiddleware>();

var celebrities = app.MapGroup("/api/Celebrities");

celebrities.MapGet("/", (IRepository<Celebrity, Lifeevent> repo) =>
{
    try
    {
        var result = repo.GetAllCelebrities();
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapGet("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        var celebrity = repo.GetCelebrityById(id);
        return celebrity != null ? Results.Ok(celebrity) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapGet("/Lifeevents/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        var celebrity = repo.GetCelebrityByLifeeventId(id);
        return celebrity != null ? Results.Ok(celebrity) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapDelete("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        return repo.DelCelebrity(id) ? Results.NoContent() : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapPost("/", (IRepository<Celebrity, Lifeevent> repo, Celebrity celebrity) =>
{
    try
    {
        if (!repo.AddCelebrity(celebrity))
            return Results.BadRequest("Could not add celebrity");

        return Results.Created($"/api/Celebrities/{celebrity.Id}", celebrity);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapPut("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id, Celebrity celebrity) =>
{
    try
    {
        return repo.UpdCelebrity(id, celebrity) ? Results.NoContent() : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

celebrities.MapGet("/photo/{fname}", async (IOptions<CelebritiesConfig> config, string fname) =>
{
    try
    {
        var photoPath = Path.Combine(config.Value.PhotoFolder, fname);
        if (!System.IO.File.Exists(photoPath))
            return Results.NotFound();

        return Results.File(photoPath, "image/jpeg");
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

var lifeevents = app.MapGroup("/api/Lifeevents");

lifeevents.MapGet("/", (IRepository<Celebrity, Lifeevent> repo) =>
{
    try
    {
        var result = repo.GetAllLifeevents();
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

lifeevents.MapGet("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        var lifeevent = repo.GetLifeevetById(id);
        return lifeevent != null ? Results.Ok(lifeevent) : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

lifeevents.MapGet("/Celebrities/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        var events = repo.GetLifeeventsByCelebrityId(id);
        return Results.Ok(events);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

lifeevents.MapDelete("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id) =>
{
    try
    {
        return repo.DelLifeevent(id) ? Results.NoContent() : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

lifeevents.MapPost("/", (IRepository<Celebrity, Lifeevent> repo, Lifeevent lifeevent) =>
{
    try
    {
        if (!repo.AddLifeevent(lifeevent))
            return Results.BadRequest("Could not add life event");

        return Results.Created($"/api/Lifeevents/{lifeevent.Id}", lifeevent);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

lifeevents.MapPut("/{id:int:min(1)}", (IRepository<Celebrity, Lifeevent> repo, int id, Lifeevent lifeevent) =>
{
    try
    {
        return repo.UpdLifeevent(id, lifeevent) ? Results.NoContent() : Results.NotFound();
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});



app.Run();