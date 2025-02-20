/*11-01*/
// Подключаем встроенный модуль для работы с HTTP
let http = require('http');
// Подключаем встроенный модуль для работы с файловой системой
let fs = require('fs');
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket сервер, который будет прослушивать порт 4000 на локальном хосте
// Прописываем путь для WebSocket-соединений "/wsserver"
const wsServer = new WebSocket.Server({port:4000, host: 'localhost', path: '/wsserver'});

// Переменная k будет использоваться для нумерации загружаемых файлов
let k = 0;

// Проверяем, существует ли директория "upload" для сохранения загруженных файлов
if (!fs.existsSync('./upload')) {
    // Если директория не существует, создаем ее
    fs.mkdirSync('./upload');
}

// Устанавливаем обработчик событий для WebSocket-сервера при каждом подключении нового клиента
wsServer.on('connection', (ws) =>{
    console.log('new websocket connection'); // Логируем информацию о новом подключении

    // Создаем поток, который будет читать данные из WebSocket-соединения
    const socketStream = WebSocket.createWebSocketStream(ws);

    // Создаем поток записи, который будет сохранять данные в файл в директории "upload"
// Файл будет называться "example" с номером, инкрементируемым с каждым новым файлом (например, example1.txt, example2.txt и т.д.)
    const fileStream = fs.createWriteStream(`./upload/example${++k}.txt`);

    // Перенаправляем данные из WebSocket потока в поток записи в файл
    socketStream.pipe(fileStream);

    // Обрабатываем событие завершения записи в файл
    fileStream.on('finish', ()=>{
        console.log('loaded'); // Логируем сообщение о завершении загрузки файла
    });

    // Обрабатываем возможные ошибки при записи в файл
    fileStream.on('error', (err)=>{
        console.log('error', err); // Логируем информацию об ошибке
    });

});

// Устанавливаем обработчик ошибок для WebSocket-сервера
wsServer.on('error', (err)=>{
    console.log('error', err); // Логируем ошибку сервера
});

// Логируем сообщение о том, что WebSocket сервер запущен и слушает порт 4000
console.log(`websocket server running on ws://localhost:4000`);

/*11-01a*/
// Подключаем встроенный модуль для работы с файловой системой
let fs = require('fs');

// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-клиент, который подключается к серверу по адресу 'ws://localhost:4000/wsserver'
// Это означает, что клиент будет пытаться установить соединение с сервером, который прослушивает этот адрес
const ws = new WebSocket('ws://localhost:4000/wsserver');

// Устанавливаем обработчик для события 'open', которое срабатывает, когда соединение с сервером установлено
ws.on('open', ()=>{
    console.log('connection established'); // Логируем сообщение о том, что соединение установлено

    // Создаем поток, который будет отправлять данные по WebSocket-соединению
    const sendStream = WebSocket.createWebSocketStream(ws);

    // Создаем поток для чтения содержимого файла "example.txt" из текущей директории
    const filetosend = fs.createReadStream(`./example.txt`);

    // Перенаправляем данные из потока чтения файла в поток отправки через WebSocket
    filetosend.pipe(sendStream);

    // Устанавливаем обработчик события 'end' для потока чтения файла
    // Это событие срабатывает, когда весь файл будет прочитан
    filetosend.on('end', ()=>{
        console.log('file send'); // Логируем сообщение о том, что файл отправлен
        ws.close(); // Закрываем WebSocket-соединение после отправки файла
    });
});

// Устанавливаем обработчик ошибок для WebSocket-соединения
ws.on('error', (err) =>{
    console.error('error', err); // Логируем информацию об ошибке, если она возникнет
});

/*11-02*/
// Подключаем встроенный модуль для работы с файловой системой
let fs = require('fs');

// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-сервер, который будет слушать соединения на порту 4000
// Он будет доступен на локальном хосте по пути '/wsserver'
const wsServer = new WebSocket.Server({ port: 4000, host: 'localhost', path: '/wsserver' });

// Проверяем, существует ли директория "download" для хранения файлов, которые будут отправляться клиенту
if (!fs.existsSync('./download')) {
    // Если директория не существует, создаем ее
    fs.mkdirSync('./download'); 
}

// Устанавливаем обработчик для события 'connection', которое срабатывает, когда клиент подключается к серверу
wsServer.on('connection', (ws) => {
    console.log('websocket connection'); // Логируем информацию о подключении клиента

    // Указываем путь к файлу, который будет отправлен клиенту
    const fileToSend = './download/example.txt'; 

    // Проверяем, существует ли файл, который должен быть отправлен
    if (fs.existsSync(fileToSend)) {
        // Если файл существует, создаем поток для чтения содержимого файла
        const fileStream = fs.createReadStream(fileToSend);

        // Создаем поток для отправки данных через WebSocket-соединение
        const socketStream = WebSocket.createWebSocketStream(ws);

        // Перенаправляем данные из потока чтения файла в поток отправки через WebSocket
        fileStream.pipe(socketStream);

        // Обрабатываем событие завершения чтения файла (событие 'end')
        fileStream.on('end', () => {
            console.log('sent'); // Логируем сообщение о том, что файл был отправлен
            ws.close(); // Закрываем WebSocket-соединение после отправки файла
        });

        // Обрабатываем возможные ошибки при чтении файла
        fileStream.on('error', (err) => {
            console.error('error', err); // Логируем ошибку при чтении файла
        });
    } else {
        // Если файл не существует, логируем ошибку и закрываем соединение с клиентом
        console.error('not exist:', fileToSend);
        ws.close();
    }
});

// Устанавливаем обработчик для ошибок WebSocket-сервера
wsServer.on('error', (err) => {
    console.error('error:', err); // Логируем ошибку сервера
});

// Логируем сообщение о том, что WebSocket-сервер успешно запущен и слушает соединения
console.log('websocket server running on ws://localhost:4000/wsserver');


/*11-02a*/
// Подключаем встроенный модуль для работы с файловой системой
let fs = require('fs');

// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-сервер, который будет слушать соединения на порту 4000
// Он будет доступен на локальном хосте по пути '/wsserver'
const wsServer = new WebSocket.Server({ port: 4000, host: 'localhost', path: '/wsserver' });

// Проверяем, существует ли директория "download" для хранения файлов, которые будут отправляться клиенту
if (!fs.existsSync('./download')) {
    // Если директория не существует, создаем ее
    fs.mkdirSync('./download'); 
}

// Устанавливаем обработчик для события 'connection', которое срабатывает, когда клиент подключается к серверу
wsServer.on('connection', (ws) => {
    console.log('websocket connection'); // Логируем информацию о подключении клиента

    // Указываем путь к файлу, который будет отправлен клиенту
    const fileToSend = './download/example.txt'; 

    // Проверяем, существует ли файл, который должен быть отправлен
    if (fs.existsSync(fileToSend)) {
        // Если файл существует, создаем поток для чтения содержимого файла
        const fileStream = fs.createReadStream(fileToSend);

        // Создаем поток для отправки данных через WebSocket-соединение
        const socketStream = WebSocket.createWebSocketStream(ws);

        // Перенаправляем данные из потока чтения файла в поток отправки через WebSocket
        fileStream.pipe(socketStream);

        // Обрабатываем событие завершения чтения файла (событие 'end')
        fileStream.on('end', () => {
            console.log('sent'); // Логируем сообщение о том, что файл был отправлен
            ws.close(); // Закрываем WebSocket-соединение после отправки файла
        });

        // Обрабатываем возможные ошибки при чтении файла
        fileStream.on('error', (err) => {
            console.error('error', err); // Логируем ошибку при чтении файла
        });
    } else {
        // Если файл не существует, логируем ошибку и закрываем соединение с клиентом
        console.error('not exist:', fileToSend);
        ws.close();
    }
});

// Устанавливаем обработчик для ошибок WebSocket-сервера
wsServer.on('error', (err) => {
    console.error('error:', err); // Логируем ошибку сервера
});

// Логируем сообщение о том, что WebSocket-сервер успешно запущен и слушает соединения
console.log('websocket server running on ws://localhost:4000/wsserver');


/*11-03*/
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-сервер, который будет прослушивать порт 4000
// Сервер будет принимать соединения по протоколу WebSocket на локальном хосте
const wsServer = new WebSocket.Server({ port: 4000 });

// Переменная, которая будет отслеживать количество отправленных сообщений
let messageCount = 0;

// Устанавливаем обработчик события 'connection', который срабатывает при каждом подключении клиента
wsServer.on('connection', (ws) => {
    console.log('new websocket connection'); // Логируем информацию о новом подключении

    // Создаем интервал, который каждые 15 секунд будет отправлять новое сообщение клиенту
    const messageInterval = setInterval(() => {
        // Генерируем новое сообщение, используя переменную messageCount
        const message = `11-03-server: ${++messageCount}`;
        
        // Отправляем сообщение клиенту
        ws.send(message);
        
        // Логируем сообщение, которое отправляется
        console.log(`sent: ${message}`);
    }, 15000); // Интервал 15 секунд

    // Устанавливаем обработчик события 'pong', который срабатывает, когда сервер получает ping от клиента
    ws.on('pong', () => {
        // Обновляем свойство isAlive на true, что означает, что клиент жив и активен
        ws.isAlive = true;
    });

    // Устанавливаем обработчик для события 'close', которое срабатывает, когда клиент закрывает соединение
    ws.on('close', () => {
        console.log('disconnected'); // Логируем, что клиент отключился
        clearInterval(messageInterval); // Останавливаем интервал, который отправлял сообщения
    });

    // Устанавливаем обработчик ошибок для WebSocket-соединения
    ws.on('error', (err) => {
        console.error('WebSocket error:', err); // Логируем ошибку при возникновении проблемы с WebSocket
    });

    // Устанавливаем свойство isAlive для каждого нового клиента на true, что сигнализирует о его активности
    ws.isAlive = true;
});

// Создаем интервал, который будет проверять каждые 5 секунд активность всех подключенных клиентов
setInterval(() => {
    // Перебираем всех клиентов, подключенных к серверу
    wsServer.clients.forEach((ws) => {
        if (!ws.isAlive) {
            // Если клиент не жив (не ответил на ping), разрываем соединение
            console.log('terminating inactive connection');
            return ws.terminate(); // Завершаем соединение с неактивным клиентом
        }
        // Если клиент жив, устанавливаем его isAlive в false и отправляем ping
        ws.isAlive = false; 
        ws.ping();
    });

    // Подсчитываем количество активных соединений (клиентов, которые находятся в состоянии OPEN)
    const activeConnections = [...wsServer.clients].filter((ws) => ws.readyState === WebSocket.OPEN).length;
    
    // Логируем количество активных соединений
    console.log(`active: ${activeConnections}`);
}, 5000); // Интервал 5 секунд

// Логируем сообщение о том, что сервер успешно запущен и слушает соединения
console.log('websocket server running on ws://localhost:4000');


/*11-03a*/
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-клиент, который подключается к серверу по адресу 'ws://localhost:4000'
// Это означает, что клиент будет пытаться установить соединение с сервером, который прослушивает этот адрес
const ws = new WebSocket('ws://localhost:4000');

// Устанавливаем обработчик события 'open', которое срабатывает, когда соединение с сервером установлено
ws.on('open', () => {
    console.log('connected'); // Логируем сообщение о том, что соединение установлено
});

// Устанавливаем обработчик события 'message', которое срабатывает, когда сервер отправляет сообщение
ws.on('message', (message) => {
    console.log(`received: ${message}`) // Логируем полученное сообщение от сервера
});

// Устанавливаем обработчик события 'ping', которое срабатывает, когда сервер отправляет ping-запрос
ws.on('ping', () => {
    console.log('ping received from server'); // Логируем сообщение о получении ping от сервера
    ws.pong(); // Отправляем pong в ответ серверу, подтверждая, что соединение активно
});

// Устанавливаем обработчик события 'close', которое срабатывает, когда сервер закрывает соединение
ws.on('close', () => {
    console.log('connection closed by server'); // Логируем информацию о закрытии соединения сервером
});

// Устанавливаем обработчик ошибок для WebSocket-соединения
ws.on('error', (err) => {
    console.error('websocket error:', err); // Логируем ошибку, если она возникла при работе с WebSocket
});


/*11-04*/
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем новый WebSocket-сервер, который будет прослушивать порт 4000 на локальном хосте по пути '/wsserver'
const wsserver = new WebSocket.Server({ port: 4000, host: 'localhost', path: '/wsserver' });

// Инициализируем счетчик сообщений, который будет использоваться для ответа клиенту
let mes = 0;

// Устанавливаем обработчик события 'connection', которое срабатывает, когда клиент подключается к серверу
wsserver.on('connection', (ws) => {
    console.log('new websocket connection'); // Логируем информацию о новом подключении

    // Устанавливаем обработчик события 'message', которое срабатывает, когда сервер получает сообщение от клиента
    ws.on('message', (message) => {
        try {
            // Пытаемся разобрать сообщение, полученное от клиента, как JSON
            const parsedMessage = JSON.parse(message);
            console.log('received from client:', parsedMessage); // Логируем полученное сообщение

            // Создаем объект ответа сервером, включающий счетчик сообщений, данные клиента и текущий timestamp
            const response = {
                server: ++mes, // Увеличиваем счетчик серверных сообщений
                client: parsedMessage.client, // Добавляем данные клиента из полученного сообщения
                timestamp: new Date().toISOString(), // Добавляем метку времени в ISO формате
            };

            // Отправляем ответ клиенту в формате JSON
            ws.send(JSON.stringify(response));
            console.log('sent to client:', response); // Логируем отправленный ответ

        } catch (err) {
            // В случае ошибки при разборе сообщения, отправляем клиенту сообщение об ошибке
            console.error('erro:', err); // Логируем ошибку
            ws.send(JSON.stringify({ error: 'invalid format' })); // Отправляем сообщение об ошибке в формате JSON
        }
    });

    // Устанавливаем обработчик для события 'close', которое срабатывает, когда клиент закрывает соединение
    ws.on('close', () => {
        console.log('client disconnected'); // Логируем информацию о том, что клиент отключился
    });

    // Устанавливаем обработчик для событий 'error', которое срабатывает в случае ошибки WebSocket-соединения
    ws.on('error', (err) => {
        console.error('websocket error:', err); // Логируем ошибку WebSocket-соединения
    });
});

// Логируем сообщение о том, что WebSocket-сервер успешно запущен и прослушивает соединения
console.log('websocket server running on ws://localhost:4000/wsserver');


/*11-04a*/
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Получаем второй аргумент командной строки (имя клиента), который будет использоваться для идентификации клиента
const parm2 = process.argv[2];

// Проверяем, был ли передан второй аргумент, если нет, выводим ошибку и завершаем выполнение программы
if (!parm2) {
    console.error('no arguments'); // Логируем ошибку, если аргумент не был передан
    process.exit(1); // Завершаем выполнение программы с кодом ошибки 1
}

// Создаем новый WebSocket-клиент, который подключается к серверу на адрес 'ws://localhost:4000/wsserver'
const ws = new WebSocket('ws://localhost:4000/wsserver');

// Устанавливаем обработчик события 'open', которое срабатывает, когда соединение с сервером установлено
ws.on('open', () => {
    // Логируем сообщение о том, что клиент подключился к серверу с именем, переданным через аргумент
    console.log(`Connected to server as "${parm2}"`);

    // Устанавливаем обработчик события 'message', которое срабатывает, когда сервер отправляет сообщение клиенту
    ws.on('message', (data) => {
        try {
            // Пытаемся разобрать полученные данные как JSON
            const response = JSON.parse(data);
            console.log('received from server:', response); // Логируем полученные данные от сервера
        } catch (err) {
            // Если не удалось разобрать данные, выводим ошибку
            console.error('invalid format:', data);
        }
    });

    // Устанавливаем интервал, который каждые 10 секунд отправляет сообщение серверу
    setInterval(() => {
        const message = {
            client: parm2, // Отправляем имя клиента, полученное через аргумент командной строки
            timestamp: new Date().toISOString(), // Добавляем метку времени в формате ISO
        };

        // Отправляем сообщение серверу в формате JSON
        ws.send(JSON.stringify(message));
        console.log('sent to server:', message); // Логируем отправленное сообщение
    }, 10000); // Интервал 10 секунд
});

// Устанавливаем обработчик ошибок для WebSocket-соединения
ws.on('error', (err) => {
    console.error('error:', err); // Логируем ошибку при работе с WebSocket
});

// Устанавливаем обработчик события 'close', которое срабатывает, когда сервер закрывает соединение
ws.on('close', () => {
    console.log('connection closed'); // Логируем, что соединение было закрыто
});


/*11-05*/
// Подключаем модуль WebSocket, который позволяет работать с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем WebSocket-сервер, который будет прослушивать порт 4000
const wss = new WebSocket.Server({ port: 4000 });

// Функция для вычисления площади круга (если один параметр) или прямоугольника (если два параметра)
const square = (params) => {
    if (params.length === 1) {
        // Площадь круга, если передан один параметр (радиус)
        return Math.PI * params[0] * params[0];
    } else if (params.length === 2) {
        // Площадь прямоугольника, если передано два параметра (длина и ширина)
        return params[0] * params[1];
    }
    // Если количество параметров не 1 или 2, выбрасываем ошибку
    throw new Error('invalid parameters');
};

// Функция для вычисления суммы всех элементов в массиве
const sum = (params) => params.reduce((acc, val) => acc + val, 0);

// Функция для вычисления произведения всех элементов в массиве
const mul = (params) => params.reduce((acc, val) => acc * val, 1);

// Функция для вычисления последовательности Фибоначчи до n-го числа
const fib = (params) => {
    const n = params[0];
    if (n < 0) throw new Error('invalid parameter'); // Проверка на корректность параметра
    const result = [0, 1];
    // Генерация последовательности Фибоначчи
    for (let i = 2; i < n; i++) {
        result.push(result[i - 1] + result[i - 2]);
    }
    // Возвращаем первые n чисел последовательности
    return result.slice(0, n);
};

// Функция для вычисления факториала числа
const fact = (params) => {
    const n = params[0];
    if (n < 0) throw new Error('invalid parameter'); // Проверка на корректность параметра
    if (n === 0) return 1; // Факториал 0 равен 1
    // Рекурсивное вычисление факториала
    return n * fact([n - 1]);
};

// Устанавливаем обработчик события 'connection', которое срабатывает при подключении клиента
wss.on('connection', (ws) => {
    // Устанавливаем обработчик события 'message', которое срабатывает при получении сообщения от клиента
    ws.on('message', (message) => {
        try {
            // Преобразуем полученное сообщение в объект
            const { method, params } = JSON.parse(message);
            let result;
            // Выбор метода, в зависимости от значения 'method' из сообщения
            switch (method) {
                case 'square':
                    result = square(params); // Вызываем функцию square
                    break;
                case 'sum':
                    result = sum(params); // Вызываем функцию sum
                    break;
                case 'mul':
                    result = mul(params); // Вызываем функцию mul
                    break;
                case 'fib':
                    result = fib(params); // Вызываем функцию fib
                    break;
                case 'fact':
                    result = fact(params); // Вызываем функцию fact
                    break;
                default:
                    throw new Error('unknown method'); // Если метод неизвестен, выбрасываем ошибку
            }
            // Отправляем результат обратно клиенту в формате JSON
            ws.send(JSON.stringify({ result }));
        } catch (err) {
            // В случае ошибки отправляем сообщение об ошибке в формате JSON
            ws.send(JSON.stringify({ error: err.message }));
        }
    });
});

// Логируем сообщение о том, что сервер запущен и прослушивает порт 4000
console.log('websocket server running on ws://localhost:4000');


/*11-05a*/
// Подключаем модуль WebSocket для работы с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем WebSocket-клиент, который подключается к серверу, работающему на 'ws://localhost:4000'
const ws = new WebSocket('ws://localhost:4000');

// Определяем массив запросов, которые будут отправляться на сервер
const rpcCalls = [
    { method: 'square', params: [3] }, // Вызов метода 'square' с параметром 3 (площадь круга)
    { method: 'square', params: [5, 4] }, // Вызов метода 'square' с параметрами 5 и 4 (площадь прямоугольника)
    { method: 'sum', params: [2] }, // Вызов метода 'sum' с одним параметром (2)
    { method: 'sum', params: [2, 4, 6, 8, 10] }, // Вызов метода 'sum' с несколькими параметрами
    { method: 'mul', params: [3] }, // Вызов метода 'mul' с одним параметром (3)
    { method: 'mul', params: [3, 5, 7, 9, 11, 13] }, // Вызов метода 'mul' с несколькими параметрами
    { method: 'fib', params: [1] }, // Вызов метода 'fib' с параметром 1 (первое число Фибоначчи)
    { method: 'fib', params: [2] }, // Вызов метода 'fib' с параметром 2 (первые два числа Фибоначчи)
    { method: 'fib', params: [7] }, // Вызов метода 'fib' с параметром 7 (первые семь чисел Фибоначчи)
    { method: 'fact', params: [0] }, // Вызов метода 'fact' с параметром 0 (факториал 0)
    { method: 'fact', params: [5] }, // Вызов метода 'fact' с параметром 5 (факториал 5)
    { method: 'fact', params: [10] }, // Вызов метода 'fact' с параметром 10 (факториал 10)
];

// Обработчик события 'open', которое срабатывает, когда WebSocket-соединение с сервером установлено
ws.on('open', () => {
    // Для каждого запроса из массива rpcCalls отправляем его на сервер в формате JSON
    rpcCalls.forEach((call) => {
        ws.send(JSON.stringify(call)); // Преобразуем запрос в строку JSON и отправляем на сервер
    });
});

// Обработчик события 'message', которое срабатывает, когда сервер отправляет сообщение клиенту
ws.on('message', (message) => {
    // Преобразуем полученное сообщение от сервера в объект
    const response = JSON.parse(message);
    if (response.error) {
        // Если в ответе есть ошибка, выводим ее в консоль
        console.error('error:', response.error);
    } else {
        // Если ошибки нет, выводим результат выполнения метода
        console.log('result:', response.result);
    }
});


/*11-05b*/
// Подключаем модуль WebSocket для работы с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем WebSocket-клиент, который подключается к серверу по адресу ws://localhost:4000
const ws = new WebSocket('ws://localhost:4000');

// Определяем массив запросов (rpcCalls), которые будем отправлять на сервер
// Каждый запрос имеет метод и параметры для выполнения на сервере
const rpcCalls = [
    { method: 'square', params: [3] }, // Вызов метода 'square' с параметром 3 (площадь круга)
    { method: 'square', params: [5, 4] }, // Вызов метода 'square' с параметрами 5 и 4 (площадь прямоугольника)
    { method: 'sum', params: [2] }, // Вызов метода 'sum' с одним параметром (2)
    { method: 'sum', params: [2, 4, 6, 8, 10] }, // Вызов метода 'sum' с несколькими параметрами
    { method: 'mul', params: [3] }, // Вызов метода 'mul' с одним параметром (3)
    { method: 'mul', params: [3, 5, 7, 9, 11, 13] }, // Вызов метода 'mul' с несколькими параметрами
    { method: 'fib', params: [1] }, // Вызов метода 'fib' с параметром 1 (первое число Фибоначчи)
    { method: 'fib', params: [2] }, // Вызов метода 'fib' с параметром 2 (первые два числа Фибоначчи)
    { method: 'fib', params: [7] }, // Вызов метода 'fib' с параметром 7 (первые семь чисел Фибоначчи)
    { method: 'fact', params: [0] }, // Вызов метода 'fact' с параметром 0 (факториал 0)
    { method: 'fact', params: [5] }, // Вызов метода 'fact' с параметром 5 (факториал 5)
    { method: 'fact', params: [10] }, // Вызов метода 'fact' с параметром 10 (факториал 10)
];

// Обработчик события 'open', который срабатывает при успешном подключении к серверу
ws.on('open', async () => {
    console.log('connection opened'); // Логируем сообщение о том, что соединение установлено

    // Создаем массив промисов для каждого RPC-вызова
    const promises = rpcCalls.map((call) => {
        return new Promise((resolve, reject) => {
            // Генерируем случайный id для каждого запроса
            const id = Math.random().toString(36).substr(2, 9);

            // Функция, которая будет обрабатывать ответы от сервера
            const handleMessage = (message) => {
                // Преобразуем сообщение от сервера в объект
                const response = JSON.parse(message);

                // Если в ответе есть ошибка, отклоняем промис с описанием ошибки
                if (response.error) {
                    reject(`Error for call ${id}: ${response.error}`);
                } else {
                    // Если ошибка нет, разрешаем промис с результатом
                    resolve({ id, result: response.result });
                }

                // Убираем обработчик события 'message', так как он больше не нужен
                ws.off('message', handleMessage);
            };

            // Добавляем обработчик для события 'message', который будет вызываться при получении ответа от сервера
            ws.on('message', handleMessage);

            // Отправляем запрос на сервер в формате JSON
            ws.send(JSON.stringify(call));
        });
    });

    try {
        // Ожидаем выполнения всех промисов и получаем их результаты
        const results = await Promise.all(promises);
        
        // Выводим результаты всех запросов в консоль
        results.forEach(({ id, result }, index) => {
            console.log(`rpc call ${index + 1} result:`, result);
        });
    } catch (error) {
        // Если возникает ошибка, выводим её в консоль
        console.error('Error:', error);
    } finally {
        // Закрываем WebSocket-соединение
        ws.close();
        console.log('connection closed'); // Логируем сообщение о закрытии соединения
    }
});

// Обработчик события 'error', который срабатывает при возникновении ошибок в WebSocket-соединении
ws.on('error', (err) => {
    console.error('error', err); // Логируем ошибку
});


/*11-05c*/
// Подключаем модуль WebSocket для работы с WebSocket-соединениями
const WebSocket = require('ws');

// Создаем WebSocket-клиент, который подключается к серверу по адресу ws://localhost:4000
const ws = new WebSocket('ws://localhost:4000');

// Функция для вызова RPC метода с заданными параметрами
const callRPC = (method, params) => {
    return new Promise((resolve, reject) => {
        // Отправляем запрос на сервер с методом и параметрами
        ws.send(JSON.stringify({ method, params }));

        // Функция, которая будет обрабатывать ответ от сервера
        const handleMessage = (message) => {
            // Преобразуем сообщение от сервера в объект
            const response = JSON.parse(message);

            // Если в ответе есть ошибка, отклоняем промис с ошибкой
            if (response.error) {
                reject(response.error);
            } else {
                // Если ошибки нет, разрешаем промис с результатом
                resolve(response.result);
            }

            // Убираем обработчик события 'message', так как он больше не нужен
            ws.off('message', handleMessage); 
        };

        // Добавляем обработчик для события 'message', который будет вызван при получении ответа от сервера
        ws.on('message', handleMessage);
    });
};

// Обработчик события 'open', который срабатывает при успешном подключении к серверу
ws.on('open', async () => {
    try {
        console.log('connection opened'); // Логируем сообщение о том, что соединение установлено

        // Выполняем несколько RPC вызовов и комбинируем их результаты
        const result = await callRPC('sum', [ // Вызов метода 'sum' на сервере
            await callRPC('square', [3]), // Вызов метода 'square' с параметром 3 (площадь круга)
            await callRPC('square', [5, 4]), // Вызов метода 'square' с параметрами 5 и 4 (площадь прямоугольника)
            await callRPC('mul', [3, 5, 7, 9, 11, 13]), // Вызов метода 'mul' с несколькими параметрами
        ]) + (await callRPC('fib', [7])) // Вызов метода 'fib' с параметром 7 (первые семь чисел Фибоначчи)
            .reduce((acc, val) => acc + val, 0) * await callRPC('mul', [2, 4, 6]); // Вызов метода 'mul' с параметрами 2, 4, 6

        // Логируем итоговый результат вычислений
        console.log('result:', result);
    } catch (error) {
        // Если возникает ошибка в процессе вычислений, выводим ошибку
        console.error('error:', error);
    } finally {
        // Закрываем WebSocket-соединение
        ws.close();
        console.log('connection closed'); // Логируем сообщение о закрытии соединения
    }
});

// Обработчик события 'error', который срабатывает при возникновении ошибок в WebSocket-соединении
ws.on('error', (err) => {
    console.error('error:', err); // Логируем ошибку
});


/*11-06*/
// Подключаем модуль для работы с командной строкой (чтение ввода пользователя)
const readline = require('readline');

// Подключаем библиотеку для работы с WebSocket RPC-сервером
const rpcWSS = require('rpc-websockets').Server;

// Конфигурация для запуска WebSocket-сервера
const config = { port: 4000, host: 'localhost', path: '/' };

// Создаем новый сервер WebSocket RPC, используя конфигурацию
const server = new rpcWSS(config);

// Определяем несколько событий, которые сервер будет слушать и на которые будет реагировать
server.event('A');
server.event('B');
server.event('C');

// Создаем интерфейс для чтения ввода пользователя через командную строку
const rl = readline.createInterface({
    input: process.stdin,   // Ввод данных из стандартного ввода (клавиатуры)
    output: process.stdout, // Вывод данных в стандартный вывод (консоль)
    terminal: false, ч       // Отключаем режим терминала (чтобы можно было вводить несколько строк)
});

// Печатаем в консоль список доступных событий
console.log('A, B, C');

// Слушаем событие ввода данных (пользователь вводит строку) с помощью `line` event
rl.on('line', (line) => {
    // Проверяем, соответствует ли введенная строка одному из допустимых событий
    if (['A', 'B', 'C'].includes(line)) {
        // Если введена строка, которая является допустимым событием, вызываем метод `emit` для отправки события
        server.emit(line);
        // Печатаем в консоль, что событие было отправлено
        console.log(`Event ${line} `);
    } else {
        // Если введена строка, которая не является допустимым событием, выводим сообщение об ошибке
        console.log('Invalid event');
    }
});


/*11-06a*/
// Подключаем библиотеку для работы с WebSocket-клиентом, которая поддерживает RPC.
const rpcWSC = require('rpc-websockets').Client;

// Создаем новый WebSocket-клиент, который будет подключаться к серверу по адресу ws://localhost:4000
const client = new rpcWSC('ws://localhost:4000');

// Обработчик события "open", который срабатывает, когда соединение с сервером установлено.
client.on('open', () => {
    console.log('connected');  // Печатаем сообщение, что соединение установлено.

    // Подписываемся на событие с именем 'A' на сервере.
    client.subscribe('A');

    // Обработчик события 'A', который срабатывает каждый раз, когда сервер эмиттирует это событие.
    client.on('A', () => {
        console.log('event A');  // Печатаем сообщение, что событие A было получено.
    });
});

// Обработчик события ошибки при работе с WebSocket-клиентом.
client.on('error', (err) => {
    console.error('error:', err);  // Печатаем ошибку, если она произошла.
});


/*11-06b*/
// Подключаем библиотеку для работы с WebSocket-клиентом с поддержкой RPC.
const rpcWSC = require('rpc-websockets').Client;

// Создаем новый WebSocket-клиент, который будет подключаться к серверу по адресу ws://localhost:4000
const client = new rpcWSC('ws://localhost:4000');

// Обработчик события "open", который срабатывает, когда соединение с сервером установлено.
client.on('open', () => {
    console.log('connected to server');  // Печатаем сообщение в консоль, что подключение успешно установлено.

    // Подписываемся на событие с именем 'B' на сервере.
    client.subscribe('B');

    // Обработчик события 'B', который срабатывает каждый раз, когда сервер эмиттирует это событие.
    client.on('B', () => {
        console.log('event B');  // Печатаем в консоль, что событие 'B' было получено.
    });
});

// Обработчик события ошибки при работе с WebSocket-клиентом.
client.on('error', (err) => {
    console.error('error:', err);  // Печатаем ошибку в консоль, если она произошла.
});


/*11-06c*/
// Подключаем библиотеку для работы с WebSocket-клиентом с поддержкой RPC.
const rpcWSC = require('rpc-websockets').Client;

// Создаем новый WebSocket-клиент, который будет подключаться к серверу по адресу ws://localhost:4000
const client = new rpcWSC('ws://localhost:4000');

// Обработчик события "open", который срабатывает, когда соединение с сервером установлено.
client.on('open', () => {
    console.log('connected to server');  // Печатаем сообщение, что соединение с сервером успешно установлено.

    // Подписываемся на событие с именем 'C' на сервере.
    client.subscribe('C');

    // Обработчик события 'C', который срабатывает каждый раз, когда сервер эмиттирует это событие.
    client.on('C', () => {
        console.log('event C');  // Печатаем сообщение, что событие 'C' было получено.
    });
});

// Обработчик события ошибки при работе с WebSocket-клиентом.
client.on('error', (err) => {
    console.error('error:', err);  // Печатаем ошибку, если она произошла.
});


/*11-07*/
// Подключаем библиотеку для работы с WebSocket-сервером с поддержкой RPC.
const rpcWSS = require('rpc-websockets').Server;

// Создаем новый WebSocket-сервер, который будет работать на порту 4000 на локальной машине.
const server = new rpcWSS({ port: 4000, host: 'localhost' });

// Регистрируем RPC-метод 'notify', который будет обрабатывать уведомления с типом и сообщением.
server.register('notify', ({ type, message }) => {
    // Проверяем, что тип уведомления является допустимым ('A', 'B', или 'C').
    if (['A', 'B', 'C'].includes(type)) {
        // Если тип допустим, выводим уведомление в консоль и возвращаем результат.
        console.log(`received notification: ${type} - ${message}`);
        return { result: `Notification ${type}` };  // Отправляем ответ с результатом.
    } else {
        // Если тип неизвестен, возвращаем ошибку.
        return { error: `unknown: ${type}` };  // Отправляем ошибку.
    }
});

// Выводим в консоль сообщение, что сервер запущен и работает на указанном адресе.
console.log('websocket server running on ws://localhost:4000');


/*11-07a*/
// Подключаем библиотеку для работы с WebSocket-клиентом с поддержкой RPC.
const rpcWSC = require('rpc-websockets').Client;

// Создаем новый WebSocket-клиент, который подключается к серверу по адресу ws://localhost:4000
let ws = new rpcWSC('ws://localhost:4000');

// Настроим кодировку ввода с консоли как utf-8.
process.stdin.setEncoding('utf-8');

// Устанавливаем обработчик событий для ввода с клавиатуры.
process.stdin.on('readable', () => {
    let chunk = process.stdin.read();  // Читаем введенные данные.
    
    if (chunk) {  // Если данные были прочитаны
        let input = chunk.trim();  // Убираем лишние пробелы вокруг введенного текста
        
        // Проверяем, что введенный текст является допустимым типом ('A', 'B' или 'C')
        if (input === 'A' || input === 'B' || input === 'C') {
            
            // Отправляем RPC-вызов 'notify' на сервер с типом и сообщением
            ws.call('notify', { type: input, message: `message${input}` })
                .then(() => console.log(`notification ${input} sent`))  // Если успешно, выводим сообщение
                .catch(err => console.error('error:', err));  // Если произошла ошибка, выводим ошибку
        }
    }
});

// Когда соединение с сервером открыто, выводим сообщение в консоль.
ws.on('open', () => {
    console.log('connected to the server');
});
