var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWelcomePage("/aspnetcore");

app.MapGet("/aspnetcore", ()=> "hello");

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();
