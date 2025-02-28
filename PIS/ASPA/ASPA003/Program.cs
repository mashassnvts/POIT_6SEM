using DAL003;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Data", "Images")),
    RequestPath = "/photos", 
    OnPrepareResponse = context =>
    {
        context.Context.Response.Headers["Content-Disposition"] = "attachment; filename=" + Path.GetFileName(context.File.Name);
    }
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Data", "download")), 
    RequestPath = "/Data/download", 
    OnPrepareResponse = context =>
    {
        context.Context.Response.Headers["Content-Disposition"] = "attachment; filename=" + Path.GetFileName(context.File.Name);
    }
});

app.UseDirectoryBrowser(new DirectoryBrowserOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Data", "download")),
    RequestPath = "/Data/download" 
});

app.MapGet("/", () => "Hello");

app.Run();