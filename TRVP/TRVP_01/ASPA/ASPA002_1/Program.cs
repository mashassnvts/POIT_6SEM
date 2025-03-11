using Microsoft.Extensions.FileProviders;
using System.IO;
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();


var defaultFilesOptions = new DefaultFilesOptions();
defaultFilesOptions.DefaultFileNames.Clear();
defaultFilesOptions.DefaultFileNames.Add("Neumann.html");
app.UseDefaultFiles(defaultFilesOptions);
app.UseStaticFiles();

app.Map("/static", staticApp =>
{
    staticApp.UseStaticFiles();
});


app.UseDefaultFiles();
app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "Picture")),
    RequestPath = "/Picture"
});
app.Run();
