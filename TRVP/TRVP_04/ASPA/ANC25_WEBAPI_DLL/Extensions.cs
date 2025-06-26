using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using DAL_Celebrity;
using DAL_Celebrity_MSSQL;
using ANC25_WEBAPI_DLL.ViewModels;
using ANC25_WEBAPI_DLL.Models;

namespace ANC25_WEBAPI_DLL
{
    public static class ANC25Extensions
    {
        public static void AddANC25Configuration(this WebApplicationBuilder builder)
        {
            builder.Configuration
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("Celebrities.config.json");

            builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));
        }

        public static void AddANC25Services(this WebApplicationBuilder builder)
        {
            builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));
            builder.Services.AddSingleton<CountryCodes>(provider =>
            {
                var config = provider.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
                var env = provider.GetRequiredService<IWebHostEnvironment>();
                var fullPath = Path.Combine(env.ContentRootPath, config.CountryCodesPath);
                if (!File.Exists(fullPath))
                {
                    throw new FileNotFoundException($"Файл с кодами стран не найден по пути: {fullPath}");
                }
                var json = File.ReadAllText(fullPath);
                var codes = JsonSerializer.Deserialize<List<CountryCode>>(json) ??
                           throw new InvalidOperationException("Не удалось десериализовать коды стран");
                return new CountryCodes { Codes = codes };
            });
            builder.Services.AddSingleton<CelebrityTitles>();
            builder.Services.AddScoped<IRepository<Celebrity, Lifeevent>>(_ =>
                CelebrityRepository.Create(builder.Configuration.GetValue<string>("Celebrities:ConnectionString")));
        }
    }
}