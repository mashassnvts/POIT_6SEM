using DAL004;
using Microsoft.AspNetCore.Diagnostics;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

Repository.JSONFileName = "data.json";
using (IRepository repository = Repository.Create("Data"))
{
    SurnameFilter.Repository = repository;
    PhotoExistFilter.Repository = repository;
    UpdateCelebrityFilter.Repository = repository;
    DeleteCelebrityFilter.Repository = repository;

    app.UseExceptionHandler("/Celebrities/Error");
    RouteGroupBuilder api = app.MapGroup("/Celebrities");

    api.MapGet("/", () => repository.getAllCelebrities());
    api.MapGet("/{id:int}", (int id) =>
    {
        Celebrity? celebrity = repository.getCelebrityById(id);
        if (celebrity == null) throw new FoundByIdException($"Celebrity Id = {id}");
        return celebrity;
    });

    api.MapPost("/", (Celebrity celebrity) =>
    {
        int? id = repository.addCelebrity(celebrity);
        if (id == null) throw new AddCelebrityException("/Celebrities error, id == null");
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        return new Celebrity((int)id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
    })
    .AddEndpointFilter<SurnameFilter>()
    .AddEndpointFilter<PhotoExistFilter>();

    api.MapPut("/{id:int}", (int id, Celebrity celebrity) =>
    {
        bool isUpdated = repository.updCelebrityById(id, celebrity);
        if (!isUpdated) throw new FoundByIdException($"Celebrity Id = {id} not found for update");
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        return Results.Ok(new { message = $"Celebrity with Id = {id} updated successfully" });
    })
    .AddEndpointFilter<UpdateCelebrityFilter>();

    api.MapDelete("/{id:int}", (int id) =>
    {
        bool isDeleted = repository.delCelebrityById(id);
        if (isDeleted)
        {
            return Results.Ok(new { message = $"Celebrity with Id = {id} deleted successfully" });
        }
        else
        {
            return Results.NotFound(new { error = $"Celebrity with Id = {id} not found" });
        }
    })
    .AddEndpointFilter<DeleteCelebrityFilter>();

    api.MapFallback((HttpContext ctx) => Results.NotFound(new { error = $"path (ctx.Request.Path) not supported" }));
    api.Map("/Error", (HttpContext ctx) =>
    {
        Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
        IResult rc = Results.Problem(detail: "Panic", instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);
        if (ex != null)
        {
            if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DirectoryNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is FoundByIdException) rc = Results.NotFound(ex.Message); // не найден
            if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message); // ошибка в формате запроса
            if (ex is SaveException) rc = Results.Problem(title: "ASPA004/SaveChanges", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is AddCelebrityException) rc = Results.Problem(title: "ASPA004/addCelebrity", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DeleteException) rc = Results.Problem(title: "ASPA004/Delete", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is UpdateException) rc = Results.Problem(title: "ASP004/Update", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is ArgumentNullException)
            {
                rc = Results.Problem(title: "Validation Error", detail: ex.Message, statusCode: 500);
            }
            if (ex is InvalidDataException)
            {
                rc = Results.Conflict(new { error = ex.Message });
            }
            if (ex is InvalidOperationException)
            {
                rc = Results.Conflict(new { error = ex.Message });
            }
        }
        return rc;
    });

    app.Run();
}
public class FoundByIdException : Exception { public FoundByIdException(string message) : base($"Found by Id: {message}") { } };
public class SaveException : Exception { public SaveException(string message) : base($"SaveChanges error: {message}") { } };
public class AddCelebrityException : Exception { public AddCelebrityException(string message) : base($"AddCelebrityException error: {message}") { } };
public class DeleteException : Exception { public DeleteException(string message) : base($"Delete error: {message}") { } }
public class UpdateException : Exception { public UpdateException(string message) : base($"Update error:  {message}") { } };