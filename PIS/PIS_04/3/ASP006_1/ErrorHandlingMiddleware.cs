using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ASP006_1
{

    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;

        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            try
            {
                await _next(context);

                // Обработка стандартных кодов ошибок
                if (context.Response.StatusCode >= 400)
                {
                    await HandleErrorResponse(context);
                }
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
            finally
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }

        private async Task HandleErrorResponse(HttpContext context)
        {
            context.Response.ContentType = "application/problem+json";
            var statusCode = context.Response.StatusCode;
            var error = new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                Title = "Not Found",
                Status = statusCode,
                Detail = $"{statusCode}004: Resource not found",
                Instance = context.Request.Path
            };

            var json = JsonSerializer.Serialize(error);
            await context.Response.WriteAsync(json);
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = GetStatusCode(exception);
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";

            var error = new ProblemDetails
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                Title = "Internal Server Error",
                Status = statusCode,
                Detail = exception.Message,
                Instance = context.Request.Path
            };

            if (context.Response.StatusCode == 404)
            {
                error.Title = "Not Found";
                error.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
                error.Detail = $"{statusCode}004: Resource not found";
            }

            var json = JsonSerializer.Serialize(error);
            await context.Response.WriteAsync(json);

            _logger.LogError(exception, "An error occurred: {Message}", exception.Message);
        }

        private static int GetStatusCode(Exception exception) => exception switch
        {
            KeyNotFoundException => StatusCodes.Status404NotFound,
            ArgumentException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
    }

}
