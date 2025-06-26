using ANC25_WEBAPI_DLL;
using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.AddANC25Configuration();
        builder.AddANC25Services();
        builder.Services.AddControllersWithViews();//
        builder.Services.Configure<FormOptions>(options =>
        {
            options.MemoryBufferThreshold = int.MaxValue;
            options.MultipartBodyLengthLimit = 5_242_880;
            options.ValueLengthLimit = int.MaxValue;
        });
        builder.Services.AddControllersWithViews(options =>
        {
            options.ModelMetadataDetailsProviders.Add(new ExcludeBindingMetadataProvider(typeof(SelectList)));
        });
        builder.Services.AddScoped<ASPA008_1.Services.ICountryService, ASPA008_1.Services.CountryService>();//

        var app = builder.Build();

        var tempPath = Path.Combine(builder.Environment.WebRootPath, "temp");
        var photosPath = Path.Combine(builder.Environment.WebRootPath, "Photos");
        if (!Directory.Exists(tempPath))
        {
            Directory.CreateDirectory(tempPath);
            Console.WriteLine($"Создана папка temp: {tempPath}");
        }
        if (!Directory.Exists(photosPath))
        {
            Directory.CreateDirectory(photosPath);
            Console.WriteLine($"Создана папка photos: {photosPath}");
        }

        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseANC25ErrorHandler("ASPA008_1");
        app.MapCelebrities();
        app.MapLifeevents();
        app.MapPhotoCelebrities();

        app.MapControllerRoute(
            name: "celebrity",
            pattern: "/0",
            defaults: new { Controller = "Celebrities", Action = "NewHumanForm" });
        //
        app.MapControllerRoute(
            name: "celebrity",
            pattern: "/{id:int:min(1)}",
            defaults: new { Controller = "Celebrities", Action = "Human" });

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Celebrities}/{action=Index}/{id?}");

        app.Run();
    }
}