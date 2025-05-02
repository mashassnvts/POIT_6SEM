using DAL004;
using Microsoft.AspNetCore.Diagnostics;
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);

// Регистрация зависимости IRepository
builder.Services.AddScoped<IRepository, Repository>(provider => (Repository)Repository.Create("Data"));

var app = builder.Build();

// Настройка файла JSON
Repository.JSONFileName = "data.json";

app.UseExceptionHandler("/celebrities/Error");

// Обработчики маршрутов
app.MapGet("/Celebrities", (IRepository repository) => repository.getAllCelebrities());

app.MapGet("/Celebrities/{id:int}", (int id, IRepository repository) =>
{
    Celebrity? celebrity = repository.getCelebrityById(id);
    if (celebrity == null) throw new FoundByIdException($"Celebrity Id = {id}");
    return celebrity;
});

app.MapPost("/Celebrities", (Celebrity celebrity, IRepository repository) =>
{
    int? id = repository.addCelebrity(celebrity);
    if (id == null) throw new AddCelebrityException("/Celebrities error, id == null");
    if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
    return new Celebrity((int)id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
})
.AddEndpointFilter(async (context, next) =>
{
    Celebrity celebrity = context.GetArgument<Celebrity>(0);

    if (celebrity == null)
    {
        throw new CustomValidationException("Celebrity parameter is null", 500);
    }

    if (string.IsNullOrEmpty(celebrity.Surname) || celebrity.Surname.Length < 2)
    {
        throw new CustomValidationException("Surname is null or its length is less than 2 characters", 409);
    }

    return await next(context);
})
.AddEndpointFilter(async (context, next) =>
{
    Celebrity celebrity = context.GetArgument<Celebrity>(0);
    IRepository repository = context.HttpContext.RequestServices.GetRequiredService<IRepository>();

    if (celebrity == null)
    {
        throw new CustomValidationException("Celebrity parameter is null", 500);
    }

    if (repository.getAllCelebrities().Any(c => c.Surname == celebrity.Surname))
    {
        throw new CustomValidationException("Celebrity with the same Surname already exists", 409);
    }

    return await next(context);
})
.AddEndpointFilter(async (context, next) =>
{
    Celebrity celebrity = context.GetArgument<Celebrity>(0);
    IRepository repository = context.HttpContext.RequestServices.GetRequiredService<IRepository>();

    if (celebrity == null)
    {
        throw new CustomValidationException("Celebrity parameter is null", 500);
    }

    string photoFileName = Path.GetFileName(celebrity.PhotoPath);
    string photoFilePath = Path.Combine(repository.BasePath, photoFileName);

    if (!File.Exists(photoFilePath))
    {
        throw new NotFoundException($"Photo file not found: {photoFileName}");
    }

    return await next(context);
});

app.MapPut("/Celebrities/{id:int}", (int id, Celebrity celebrity, IRepository repository) =>
{
    bool isUpdated = repository.updCelebrityById(id, celebrity);
    if (!isUpdated) throw new FoundByIdException($"Celebrity Id = {id} not found for update");
    if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
    return Results.Ok(new { message = $"Celebrity with Id = {id} updated successfully" });
});

app.MapDelete("/Celebrities/{id:int}", (int id, IRepository repository) =>
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
});

app.MapFallback((HttpContext ctx) => Results.NotFound(new { error = $"Path {ctx.Request.Path} not supported" }));

app.Map("/Celebrities/Error", (HttpContext ctx) =>
{
    Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    IResult rc = Results.Problem(detail: "Panic", instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);
    if (ex != null)
    {
        if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is DirectoryNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is FoundByIdException) rc = Results.NotFound(ex.Message);
        if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message);
        if (ex is SaveException) rc = Results.Problem(title: "ASPA004/SaveChanges", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is AddCelebrityException) rc = Results.Problem(title: "ASPA004/addCelebrity", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is DeleteException) rc = Results.Problem(title: "ASPA004/Delete", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is UpdateException) rc = Results.Problem(title: "ASP004/Update", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
        if (ex is CustomValidationException validationEx) { rc = Results.Problem(title: "Validation Error", detail: validationEx.Message, instance: app.Environment.EnvironmentName, statusCode: validationEx.StatusCode); }
        if (ex is NotFoundException notFoundEx) { rc = Results.Problem(title: "Not Found", detail: notFoundEx.Message, instance: app.Environment.EnvironmentName, statusCode: 404); }
    }
    return rc;
});

app.Run();
public class FoundByIdException : Exception { public FoundByIdException(string message) : base($"Found by Id: {message}") { } };
public class SaveException : Exception { public SaveException(string message) : base($"SaveChanges error: {message}") { } };
public class AddCelebrityException : Exception { public AddCelebrityException(string message) : base($"AddCelebrityException error: {message}") { } };
public class DeleteException : Exception { public DeleteException(string message) : base($"Delete error: {message}") { } }
public class UpdateException : Exception { public UpdateException(string message) : base($"Update error:  {message}") { } };
public class NotFoundException : Exception { public NotFoundException(string message) : base($"Not found error:  {message}") { } };
public class CustomValidationException : Exception { public int StatusCode { get; } public CustomValidationException(string message, int statusCode) : base(message) { StatusCode = statusCode; } }