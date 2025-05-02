using DAL004; // Пространство имён для доступа к репозиторию и классам данных
using Microsoft.AspNetCore.Diagnostics; // Для обработки исключений
using System.ComponentModel.DataAnnotations; // Для валидации данных (хотя в коде явно не используется)

// Создание экземпляра приложения ASP.NET Core
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Установка имени файла JSON, в котором хранятся данные
Repository.JSONFileName = "data.json";

// Создание экземпляра репозитория для работы с данными
using (IRepository repository = Repository.Create("Data"))
{
    // Настройка глобального обработчика исключений
    app.UseExceptionHandler("/celebrities/Error");

    // Маршрут для получения всех знаменитостей
    app.MapGet("/Celebrities", () => repository.getAllCelebrities());

    // Маршрут для получения знаменитости по ID
    app.MapGet("/Celebrities/{id:int}", (int id) =>
    {
        // Поиск знаменитости по ID
        Celebrity? celebrity = repository.getCelebrityById(id);
        // Если знаменитость не найдена, выбрасываем исключение
        if (celebrity == null) throw new FoundByIdException($"Celebrity Id = {id}");
        // Возвращаем найденную знаменитость
        return celebrity;
    });

    // Маршрут для добавления новой знаменитости
    app.MapPost("/Celebrities", (Celebrity celebrity) =>
    {
        // Добавление знаменитости в репозиторий
        int? id = repository.addCelebrity(celebrity);
        // Если ID не был возвращён, выбрасываем исключение
        if (id == null) throw new AddCelebrityException("/Celebrities error, id == null");
        // Сохранение изменений в репозитории
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        // Возвращаем созданную знаменитость с новым ID
        return new Celebrity((int)id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
    })
    // Первый фильтр для валидации данных
    .AddEndpointFilter(async (context, next) =>
    {
        // Получаем объект знаменитости из контекста
        Celebrity? celebrity = context.GetArgument<Celebrity?>(0);

        // Если объект равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Если фамилия (Surname) отсутствует или её длина меньше 2 символов, выбрасываем исключение
        if (string.IsNullOrEmpty(celebrity.Surname) || celebrity.Surname.Length < 2)
        {
            throw new InvalidDataException("Surname is null or its length is less than 2");
        }

        // Передаём управление следующему фильтру или обработчику
        return await next(context);
    })
    // Второй фильтр для проверки уникальности фамилии
    .AddEndpointFilter(async (context, next) =>
    {
        // Получаем объект знаменитости из контекста
        Celebrity? celebrity = context.GetArgument<Celebrity?>(0);

        // Если объект равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Проверяем, есть ли уже знаменитость с такой же фамилией
        if (repository.getAllCelebrities().Any(c => c.Surname == celebrity.Surname))
        {
            throw new InvalidOperationException("Celebrity with the same Surname already exists");
        }

        // Передаём управление следующему фильтру или обработчику
        return await next(context);
    })
    // Третий фильтр для проверки наличия файла с фотографией
    .AddEndpointFilter(async (context, next) =>
    {
        // Получаем объект знаменитости из контекста
        Celebrity? celebrity = context.GetArgument<Celebrity?>(0);

        // Если объект равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Получаем имя файла фотографии
        string? photoFileName = Path.GetFileName(celebrity.PhotoPath);
        // Проверяем, существует ли файл в папке BasePath
        if (!File.Exists(Path.Combine("BasePath", photoFileName)))
        {
            // Если файл не найден, добавляем заголовок в ответ
            context.HttpContext.Response.Headers.Append("X-Celebrity", $"NotFound = {photoFileName}");
        }

        // Передаём управление следующему фильтру или обработчику
        return await next(context);
    });

    // Маршрут для обновления знаменитости по ID
    app.MapPut("/Celebrities/{id:int}", (int id, Celebrity celebrity) =>
    {
        // Обновление знаменитости в репозитории
        bool isUpdated = repository.updCelebrityById(id, celebrity);
        // Если обновление не удалось, выбрасываем исключение
        if (!isUpdated) throw new FoundByIdException($"Celebrity Id = {id} not found for update");
        // Сохранение изменений в репозитории
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        // Возвращаем успешный результат
        return Results.Ok(new { message = $"Celebrity with Id = {id} updated successfully" });
    });

    // Маршрут для удаления знаменитости по ID
    app.MapDelete("/Celebrities/{id:int}", (int id) =>
    {
        // Удаление знаменитости из репозитория
        bool isDeleted = repository.delCelebrityById(id);
        // Если удаление прошло успешно, возвращаем успешный результат
        if (isDeleted)
        {
            return Results.Ok(new { message = $"Celebrity with Id = {id} deleted successfully" });
        }
        // Если знаменитость не найдена, возвращаем ошибку 404
        else
        {
            return Results.NotFound(new { error = $"Celebrity with Id = {id} not found" });
        }
    });

    // Маршрут для обработки неизвестных путей
    app.MapFallback((HttpContext ctx) => Results.NotFound(new { error = $"path {ctx.Request.Path} not supported" }));

    // Маршрут для обработки ошибок
    app.Map("/Celebrities/Error", (HttpContext ctx) =>
    {
        // Получаем информацию об исключении
        Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
        // Устанавливаем стандартный ответ с ошибкой
        IResult rc = Results.Problem(detail: "Panic", instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);

        // Обрабатываем различные типы исключений
        if (ex != null)
        {
            if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DirectoryNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is FoundByIdException) rc = Results.NotFound(ex.Message); // Ошибка 404
            if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message); // Ошибка 400
            if (ex is SaveException) rc = Results.Problem(title: "ASPA004/SaveChanges", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is AddCelebrityException) rc = Results.Problem(title: "ASPA004/addCelebrity", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DeleteException) rc = Results.Problem(title: "ASPA004/Delete", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is UpdateException) rc = Results.Problem(title: "ASP004/Update", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is ArgumentNullException) rc = Results.Problem(title: "Validation Error", detail: ex.Message, statusCode: 500);
            if (ex is InvalidDataException) rc = Results.Conflict(new { error = ex.Message });
            if (ex is InvalidOperationException) rc = Results.Conflict(new { error = ex.Message });
        }

        // Возвращаем результат обработки ошибки
        return rc;
    });

    // Запуск приложения
    app.Run();
}

// Пользовательские исключения
public class FoundByIdException : Exception { public FoundByIdException(string message) : base($"Found by Id: {message}") { } };
public class SaveException : Exception { public SaveException(string message) : base($"SaveChanges error: {message}") { } };
public class AddCelebrityException : Exception { public AddCelebrityException(string message) : base($"AddCelebrityException error: {message}") { } };
public class DeleteException : Exception { public DeleteException(string message) : base($"Delete error: {message}") { } };
public class UpdateException : Exception { public UpdateException(string message) : base($"Update error:  {message}") { } };





// Импорт необходимых библиотек
using DAL004; // Пространство имён для доступа к репозиторию и классам данных
using Microsoft.AspNetCore.Diagnostics; // Для обработки исключений
using System.ComponentModel.DataAnnotations; // Для валидации данных (хотя в коде явно не используется)

// Создание экземпляра приложения ASP.NET Core
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Установка имени файла JSON, в котором хранятся данные
Repository.JSONFileName = "data.json";

// Создание экземпляра репозитория для работы с данными
using (IRepository repository = Repository.Create("Data"))
{
    // Настройка репозитория для фильтров
    SurnameFilter.Repository = repository; // Передача репозитория в фильтр для проверки фамилии
    PhotoExistFilter.Repository = repository; // Передача репозитория в фильтр для проверки наличия фотографии
    UpdateCelebrityFilter.Repository = repository; // Передача репозитория в фильтр для обновления знаменитости
    DeleteCelebrityFilter.Repository = repository; // Передача репозитория в фильтр для удаления знаменитости

    // Настройка глобального обработчика исключений
    app.UseExceptionHandler("/Celebrities/Error");

    // Создание группы маршрутов для работы с данными знаменитостей
    RouteGroupBuilder api = app.MapGroup("/Celebrities");

    // Маршрут для получения всех знаменитостей
    api.MapGet("/", () => repository.getAllCelebrities());

    // Маршрут для получения знаменитости по ID
    api.MapGet("/{id:int}", (int id) =>
    {
        // Поиск знаменитости по ID
        Celebrity? celebrity = repository.getCelebrityById(id);
        // Если знаменитость не найдена, выбрасываем исключение
        if (celebrity == null) throw new FoundByIdException($"Celebrity Id = {id}");
        // Возвращаем найденную знаменитость
        return celebrity;
    });

    // Маршрут для добавления новой знаменитости
    api.MapPost("/", (Celebrity celebrity) =>
    {
        // Добавление знаменитости в репозиторий
        int? id = repository.addCelebrity(celebrity);
        // Если ID не был возвращён, выбрасываем исключение
        if (id == null) throw new AddCelebrityException("/Celebrities error, id == null");
        // Сохранение изменений в репозитории
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        // Возвращаем созданную знаменитость с новым ID
        return new Celebrity((int)id, celebrity.Firstname, celebrity.Surname, celebrity.PhotoPath);
    })
    // Добавление фильтра для проверки фамилии
    .AddEndpointFilter<SurnameFilter>()
    // Добавление фильтра для проверки наличия фотографии
    .AddEndpointFilter<PhotoExistFilter>();

    // Маршрут для обновления знаменитости по ID
    api.MapPut("/{id:int}", (int id, Celebrity celebrity) =>
    {
        // Обновление знаменитости в репозитории
        bool isUpdated = repository.updCelebrityById(id, celebrity);
        // Если обновление не удалось, выбрасываем исключение
        if (!isUpdated) throw new FoundByIdException($"Celebrity Id = {id} not found for update");
        // Сохранение изменений в репозитории
        if (repository.SaveChanges() <= 0) throw new SaveException("/Celebrities error, SaveChanges() <= 0");
        // Возвращаем успешный результат
        return Results.Ok(new { message = $"Celebrity with Id = {id} updated successfully" });
    })
    // Добавление фильтра для проверки данных перед обновлением
    .AddEndpointFilter<UpdateCelebrityFilter>();

    // Маршрут для удаления знаменитости по ID
    api.MapDelete("/{id:int}", (int id) =>
    {
        // Удаление знаменитости из репозитория
        bool isDeleted = repository.delCelebrityById(id);
        // Если удаление прошло успешно, возвращаем успешный результат
        if (isDeleted)
        {
            return Results.Ok(new { message = $"Celebrity with Id = {id} deleted successfully" });
        }
        // Если знаменитость не найдена, возвращаем ошибку 404
        else
        {
            return Results.NotFound(new { error = $"Celebrity with Id = {id} not found" });
        }
    })
    // Добавление фильтра для проверки данных перед удалением
    .AddEndpointFilter<DeleteCelebrityFilter>();

    // Маршрут для обработки неизвестных путей
    api.MapFallback((HttpContext ctx) => Results.NotFound(new { error = $"path {ctx.Request.Path} not supported" }));

    // Маршрут для обработки ошибок
    api.Map("/Error", (HttpContext ctx) =>
    {
        // Получаем информацию об исключении
        Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
        // Устанавливаем стандартный ответ с ошибкой
        IResult rc = Results.Problem(detail: "Panic", instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);

        // Обрабатываем различные типы исключений
        if (ex != null)
        {
            if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DirectoryNotFoundException) rc = Results.Problem(title: "ASPA00", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is FoundByIdException) rc = Results.NotFound(ex.Message); // Ошибка 404
            if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message); // Ошибка 400
            if (ex is SaveException) rc = Results.Problem(title: "ASPA004/SaveChanges", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is AddCelebrityException) rc = Results.Problem(title: "ASPA004/addCelebrity", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is DeleteException) rc = Results.Problem(title: "ASPA004/Delete", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is UpdateException) rc = Results.Problem(title: "ASP004/Update", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
            if (ex is ArgumentNullException) rc = Results.Problem(title: "Validation Error", detail: ex.Message, statusCode: 500);
            if (ex is InvalidDataException) rc = Results.Conflict(new { error = ex.Message });
            if (ex is InvalidOperationException) rc = Results.Conflict(new { error = ex.Message });
        }

        // Возвращаем результат обработки ошибки
        return rc;
    });

    // Запуск приложения
    app.Run();
}

// Пользовательские исключения
public class FoundByIdException : Exception { public FoundByIdException(string message) : base($"Found by Id: {message}") { } };
public class SaveException : Exception { public SaveException(string message) : base($"SaveChanges error: {message}") { } };
public class AddCelebrityException : Exception { public AddCelebrityException(string message) : base($"AddCelebrityException error: {message}") { } };
public class DeleteException : Exception { public DeleteException(string message) : base($"Delete error: {message}") { } };
public class UpdateException : Exception { public UpdateException(string message) : base($"Update error:  {message}") { } };



// Подключаемые пространства имен
using DAL004; // Пространство имен, вероятно, содержит интерфейсы и классы для работы с данными (например, IRepository).
using Microsoft.AspNetCore.Http; // Для работы с HTTP-запросами и ответами в ASP.NET Core.
using Microsoft.AspNetCore.Http.Features; // Для доступа к функциям и возможностям HTTP-запросов.
using System.IO; // Для работы с файловой системой.

// Класс SurnameFilter - фильтр проверки фамилии
public class SurnameFilter : IEndpointFilter
{
    // Статическое свойство для доступа к репозиторию знаменитостей
    public static IRepository? Repository { get; set; }

    // Основной метод фильтрации
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        // Извлекаем первый аргумент (ожидаем, что это объект Celebrity)
        var celebrity = context.GetArgument<Celebrity?>(0);

        // Проверка: если объект celebrity равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Проверка: фамилия не должна быть пустой или короче двух символов
        if (string.IsNullOrEmpty(celebrity.Surname) || celebrity.Surname.Length < 2)
        {
            throw new InvalidDataException("Surname is null or its length is less than 2");
        }

        // Проверяем, существует ли уже знаменитость с такой же фамилией в репозитории
        if (Repository?.getAllCelebrities().Any(c => c.Surname == celebrity.Surname) == true)
        {
            throw new InvalidOperationException("Celebrity with the same Surname already exists");
        }

        // Если все проверки пройдены, вызываем следующий делегат в цепочке фильтров
        return await next(context);
    }
}

// Класс PhotoExistFilter - фильтр проверки существования файла с фотографией
public class PhotoExistFilter : IEndpointFilter
{
    // Статическое свойство для доступа к репозиторию знаменитостей
    public static IRepository? Repository { get; set; }

    // Основной метод фильтрации
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        // Извлекаем первый аргумент (ожидаем, что это объект Celebrity)
        var celebrity = context.GetArgument<Celebrity?>(0);

        // Проверка: если объект celebrity равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Проверяем существование файла фотографии
        string? photoFileName = Path.GetFileName(celebrity.PhotoPath); // Получаем имя файла из пути
        if (!File.Exists(Path.Combine("BasePath", photoFileName))) // Проверяем наличие файла
        {
            // Если файла нет, добавляем заголовок в HTTP-ответ с информацией о проблеме
            context.HttpContext.Response.Headers.Append("X-Celebrity", $"NotFound = {photoFileName}");
        }

        // Вызываем следующий делегат в цепочке фильтров
        return await next(context);
    }
}

// Класс UpdateCelebrityFilter - фильтр проверки перед обновлением данных
public class UpdateCelebrityFilter : IEndpointFilter
{
    // Статическое свойство для доступа к репозиторию знаменитостей
    public static IRepository? Repository { get; set; }

    // Основной метод фильтрации
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        // Извлекаем аргументы: ID знаменитости и объект Celebrity
        var id = context.GetArgument<int>(0); // Извлечение ID
        var celebrity = context.GetArgument<Celebrity?>(1); // Извлечение объекта Celebrity

        // Проверка: если объект celebrity равен null, выбрасываем исключение
        if (celebrity == null)
        {
            throw new ArgumentNullException("Celebrity parameter is null");
        }

        // Проверяем, существует ли знаменитость с данным ID в репозитории
        if (Repository?.getCelebrityById(id) == null)
        {
            throw new FoundByIdException($"Celebrity Id = {id} not found for update");
        }

        // Если все проверки пройдены, вызываем следующий делегат в цепочке фильтров
        return await next(context);
    }
}

// Класс DeleteCelebrityFilter - фильтр проверки перед удалением данных
public class DeleteCelebrityFilter : IEndpointFilter
{
    // Статическое свойство для доступа к репозиторию знаменитостей
    public static IRepository? Repository { get; set; }

    // Основной метод фильтрации
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        // Извлекаем аргумент: ID знаменитости
        var id = context.GetArgument<int>(0);

        // Проверяем, существует ли знаменитость с данным ID в репозитории
        if (Repository?.getCelebrityById(id) == null)
        {
            throw new FoundByIdException($"Celebrity Id = {id} not found for delete");
        }

        // Если все проверки пройдены, вызываем следующий делегат в цепочке фильтров
        return await next(context);
    }
}



// Подключаем пространство имен для работы с обработкой исключений в ASP.NET Core
using Microsoft.AspNetCore.Diagnostics;

// Создаем и конфигурируем веб-приложение
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Добавляем middleware для обработки исключений и перенаправления на маршрут /Error
app.UseExceptionHandler("/Error");

//--- A: Маршруты с проверкой целочисленных значений

// GET-запрос с ограничением: x должен быть целым числом не более 100
app.MapGet("/A/{x:int:max(100)}", (HttpContext context, int x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// POST-запрос с ограничением: x должен быть целым числом в диапазоне [0, 100]
app.MapPost("/A/{x:int:range(0,100)}", (HttpContext context, int x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// PUT-запрос с двумя параметрами: оба должны быть положительными целыми числами
app.MapPut("/A/{x:int:min(1)}/{y:int:min(1)}", (HttpContext context, int x, int y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

// DELETE-запрос: x должен быть целым числом ≥ 1, y — в диапазоне [1, 100]
app.MapDelete("/A/{x:int:min(1)}-{y:int:range(1,100)}", (HttpContext context, int x, int y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- B: Маршруты с проверкой чисел с плавающей точкой

// GET-запрос: x должен быть числом с плавающей точкой
app.MapGet("/B/{x:float}", (HttpContext context, float x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// POST-запрос с двумя параметрами: оба должны быть числами с плавающей точкой
app.MapPost("/B/{x:float}/{y:float}", (HttpContext context, float x, float y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

// DELETE-запрос: оба параметра x и y — числа с плавающей точкой
app.MapDelete("/B/{x:float}-{y:float}", (HttpContext context, float x, float y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- C: Маршруты с проверкой логических значений

// GET-запрос: x должен быть логическим значением (true/false)
app.MapGet("/C/{x:bool}", (HttpContext context, bool x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// POST-запрос с двумя параметрами: оба должны быть логическими значениями
app.MapPost("/C/{x:bool},{y:bool}", (HttpContext context, bool x, bool y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- D: Маршруты с проверкой дат

// GET-запрос: x должен быть допустимой датой
app.MapGet("/D/{x:datetime}", (HttpContext context, DateTime x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// POST-запрос: два параметра должны быть датами, разделенными вертикальной чертой (|)
app.MapPost("/D/{x:datetime}|{y:datetime}", (HttpContext context, DateTime x, DateTime y) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x, y = y }));

//--- E: Маршруты с проверкой строк

// GET-запрос: маршрут содержит строку x, которая обязательна после "12-"
app.MapGet("/E/12-{x:required}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// PUT-запрос: строка x должна содержать только буквы (alpha) длиной от 2 до 12 символов
app.MapPut("/E/{x:alpha:length(2,12)}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

//--- F: Маршруты с регулярными выражениями

// PUT-запрос: строка x должна соответствовать регулярному выражению (email с доменом .by)
app.MapPut("/F/{x:regex(^[^@]+@[^@]+\\.by$)}", (HttpContext context, string x) =>
    Results.Ok(new { path = context.Request.Path.Value, x = x }));

// Фоллбэк-обработчик: если маршрут не найден, возвращается статус 404
app.MapFallback((HttpContext ctx) =>
    Results.NotFound(new { message = $"path {ctx.Request.Path.Value} not supported" }));

// Обработчик маршрута /Error: возвращает информацию об исключении
app.Map("/Error", (HttpContext ctx) =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error; // Получаем информацию об исключении
    return Results.Ok(new { message = ex?.Message }); // Возвращаем сообщение об ошибке
});

// Запуск приложения
app.Run();



using System;
using System.Net.Http;
using System.Net.Http.Json; // Для работы с JSON-ответами
using System.Text.Json; // Для обработки ошибок при работе с JSON
using System.Threading.Tasks; // Для работы с асинхронным кодом

// Класс для тестирования работы с HTTP-запросами
class Test
{
    // Вспомогательный класс для представления ответа от сервера
    class Answer<T>
    {
        public T? x { get; set; } = default(T?); // Поле x (параметр ответа, может быть любого типа)
        public T? y { get; set; } = default(T?); // Поле y (параметр ответа, может быть любого типа)
        public string? message { get; set; } = null; // Сообщение от сервера (например, ошибка)
    }

    // Константы для проверки результатов
    public static string OK = "OK", NOK = "NOK";

    // HTTP-клиент для выполнения запросов
    HttpClient client = new HttpClient();

    // Метод для выполнения GET-запроса
    public async Task ExecuteGET<T>(string path, Func<T?, T?, int, string> result)
    {
        await resultPRINT<T>("GET", path, await this.client.GetAsync(path), result);
    }

    // Метод для выполнения POST-запроса
    public async Task ExecutePOST<T>(string path, Func<T?, T?, int, string> result)
    {
        await resultPRINT<T>("POST", path, await this.client.PostAsync(path, null), result);
    }

    // Метод для выполнения PUT-запроса
    public async Task ExecutePUT<T>(string path, Func<T?, T?, int, string> result)
    {
        await resultPRINT<T>("PUT", path, await this.client.PutAsync(path, null), result);
    }

    // Метод для выполнения DELETE-запроса
    public async Task ExecuteDELETE<T>(string path, Func<T?, T?, int, string> result)
    {
        await resultPRINT<T>("DELETE", path, await this.client.DeleteAsync(path), result);
    }

    // Метод для обработки результата запроса и его отображения
    async Task resultPRINT<T>(string method, string path, HttpResponseMessage rm, Func<T?, T?, int, string> result)
    {
        int status = (int)rm.StatusCode; // Получение HTTP-статуса ответа
        try
        {
            // Попытка десериализовать JSON-ответ в объект Answer<T>
            Answer<T>? answer = await rm.Content.ReadFromJsonAsync<Answer<T>>() ?? default(Answer<T>);
            string r = result(default(T), default(T), status); // Первоначальный результат

            T? x = default(T), y = default(T); // Переменные для параметров ответа
            if (answer != null)
                r = result(x = answer.x, y = answer.y, status); // Если ответ успешно десериализован, обновляем результат

            // Вывод результата в консоль
            Console.WriteLine($" {r}: {method} {path}, status = {status}, x = {x}, y = {y}, m = {answer?.message}");
        }
        catch (JsonException ex)
        {
            // Обработка ошибок десериализации JSON
            string r = result(default(T), default(T), status);
            Console.WriteLine($" {r}: {method} {path}, status = {status}, x = {null}, y = {null}, m = {ex.Message}");
        }
    }
}

// Главная программа
class Program
{
    static async Task Main(string[] args)
    {
        Test test = new Test(); // Создание экземпляра класса Test

        // Раздел /A: тесты с int параметрами
        Console.WriteLine("-- /A----");
        await test.ExecuteGET<int?>("https://localhost:7120/A/3", (int? x, int? y, int status) => (x == 3 && y == null && status == 200) ? Test.OK : Test.NOK);
        await test.ExecuteGET<int?>("https://localhost:7120/A/-3", (int? x, int? y, int status) => (x == -3 && y == null && status == 200) ? Test.OK : Test.NOK);
        await test.ExecutePOST<int?>("https://localhost:7120/A/5", (int? x, int? y, int status) => (x == 5 && y == null && status == 200) ? Test.OK : Test.NOK);

        // Раздел /B: тесты с float параметрами
        Console.WriteLine("-- /B--");
        await test.ExecuteGET<float?>("https://localhost:7120/B/2.5", (float? x, float? y, int status) => (x == 2.5 && y == null && status == 200) ? Test.OK : Test.NOK);
        await test.ExecutePOST<float?>("https://localhost:7120/B/2.5/3.2", (float? x, float? y, int status) => (x == 2.5 && y == 3.2 && status == 200) ? Test.OK : Test.NOK);

        // Раздел /C: тесты с bool параметрами
        Console.WriteLine("-- /C --");
        await test.ExecuteGET<bool?>("https://localhost:7120/C/true", (bool? x, bool? y, int status) => (x == true && y == null && status == 200) ? Test.OK : Test.NOK);

        // Раздел /D: тесты с DateTime параметрами
        Console.WriteLine("-- /D");
        await test.ExecuteGET<DateTime?>("https://localhost:7120/D/2025-02-25", (DateTime? x, DateTime? y, int status) => (x == new DateTime(2025, 02, 25) && y == null && status == 200) ? Test.OK : Test.NOK);

        // Раздел /E: тесты с string параметрами
        Console.WriteLine("-- /E ---");
        await test.ExecuteGET<string?>("https://localhost:7120/E/12-bis", (string? x, string? y, int status) => (x == "bis" && y == null && status == 200) ? Test.OK : Test.NOK);

        // Раздел /F: тесты с email
        Console.WriteLine("-- /F");
        await test.ExecuteGET<string?>("https://localhost:7120/F/smw@belstu.by", (string? x, string? y, int status) => (x == "smw@belstu.by" && y == null && status == 200) ? Test.OK : Test.NOK);
    }
}
