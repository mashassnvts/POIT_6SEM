using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace ASPA006_1
{
    public class ExceptionManagerMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionManagerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    error = "Internal Server Error",
                    details = ex.Message
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
} 