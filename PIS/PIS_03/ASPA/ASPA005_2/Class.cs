using DAL004;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using System.IO;

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