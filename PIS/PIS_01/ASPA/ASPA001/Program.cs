internal class Program
{
    // Точка входа в приложение
    private static void Main(string[] args)
    {
        // Создание и настройка веб-приложения на основе переданных аргументов
        var builder = WebApplication.CreateBuilder(args);

        // Настройка логирования
        builder.Services.AddLogging(logging =>
        {
            logging.AddConsole(); // Логирование в консоль
            logging.AddDebug();   // Логирование в отладчик
        });

        // Построение приложения на основе настроек
        var app = builder.Build();

        // Определение маршрута для обработки GET-запроса на корневой URL ("/")
        app.MapGet("/", () => "Мое первое ASPA");

        // Запуск приложения
        app.Run();
    }
}