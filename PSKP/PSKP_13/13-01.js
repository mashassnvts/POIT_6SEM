/*1. Разработайте приложение 13-01, представляющее собой TCP-сервер. Сервер должен через TCP-соединение принимать строковое сообщения 
от TCP-клиента и возвращает клиенту  текст, полученного сообщения с префиксом ECHO:.   */

const net = require('net');

const HOST = '127.0.0.1';
const PORT = 4000;

const server = net.createServer((socket) => {
    console.log(`client connected: ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        console.log(`server received: ${data}`);
        socket.write(`ECHO: ${data}`);
    });

    socket.on('close', () => {
        console.log(`connection closed.`);
    });

    socket.on('error', (error) => {
        console.log(`[ERROR] client: ${error.message}`);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`TCP server running on ${HOST}:${PORT}`);
});

server.on('error', (error) => {
    console.log(`[ERROR] server: ${error.message}`);
});
