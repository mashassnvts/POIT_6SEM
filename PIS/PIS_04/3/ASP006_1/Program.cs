using ASP006_1;
using DAL_Celebrity;
using DAL_Celebrity_EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Конфигурация
builder.Configuration.AddJsonFile("Celebrities.config.json", optional: false);
builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));

// База данных
builder.Services.AddDbContext<CelebrityDbContext>((sp, options) =>
{
    var config = sp.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
    options.UseSqlServer(config.ConnectionString);
});

// Репозиторий и сервис
builder.Services.AddScoped<IRepository<Celebrity, Lifeevent>>(sp =>
{
    var config = sp.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
    return new CelebrityRepository(new Credentials(config.ConnectionString));
});

builder.Services.AddScoped<ICelebrityService, CelebrityService>();

var app = builder.Build();

app.UseStaticFiles();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseExceptionHandler("/error");
app.Urls.Add("http://localhost:5204");

var routes = new Routes(app);
app.Run();