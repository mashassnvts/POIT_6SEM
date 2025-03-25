using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseExceptionHandler("/Error");

//--- A
app.MapGet("/A/{x:int:max(100)}", (HttpContext context, int x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPost("/A/{x:int:range(0,100)}", (HttpContext context, int x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPut("/A/{x:int:min(1)}/{y:int:min(1)}", (HttpContext context, int x, int y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

app.MapDelete("/A/{x:int:min(1)}-{y:int:range(1,100)}", (HttpContext context, int x, int y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- B
app.MapGet("/B/{x:float}", (HttpContext context, float x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPost("/B/{x:float}/{y:float}", (HttpContext context, float x, float y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

app.MapDelete("/B/{x:float}-{y:float}", (HttpContext context, float x, float y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- C
app.MapGet("/C/{x:bool}", (HttpContext context, bool x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPost("/C/{x:bool},{y:bool}", (HttpContext context, bool x, bool y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- D
app.MapGet("/D/{x:datetime}", (HttpContext context, DateTime x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPost("/D/{x:datetime}|{y:datetime}", (HttpContext context, DateTime x, DateTime y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- E
app.MapGet("/E/12-{x:required}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapPut("/E/{x:alpha:length(2,12)}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

//--- F
app.MapPut("/F/{x:regex(^[^@]+@[^@]+\\.by$)}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

app.MapFallback((HttpContext ctx) =>
    Results.NotFound(new { message = $"path {ctx.Request.Path.Value} not supported" }));

app.Map("/Error", (HttpContext ctx) =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    return Results.Ok(new { message = ex?.Message });
});

app.Run();