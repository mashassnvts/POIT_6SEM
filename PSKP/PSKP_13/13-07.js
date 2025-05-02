/*12. Разработайте приложение 13-07, представляющее собой TCP-сервер, прослушивающий 2 порта: 40000, 50000. Сервер должен через TCP-соединения 
 принимать потоки 32-битовых чисел (по одному числу за каждую оправку клиентом). Сервер возвращает клиенту полученное сообщение (число) 
 с префиксом ECHO:.*/

 const { createServer } = require('http');
 const net = require('net');
 const HOST = '127.0.0.1';
 const PORT_4000 = 4000;
 const PORT_5000 = 5000;
 
 const socketHandler = (port) => {
     return (socket) => {
         console.log(
             `[${port}] Client connected: ${socket.remoteAddress}:${socket.remotePort}`
         );
 
         socket.on('data', (data) => {
             console.log(
                 `[${port}] Server received: `,
                 data,
                 ` number = ${data.readInt32LE()}`
             );
             socket.write('ECHO: ' + data.readInt32LE());
         });
 
         socket.on('close', () => {
             console.log(`[${port}] Connection closed.`);
         });
         socket.on('error', (error) => {
             console.log(`[ERROR] Client - ${port}: ${error.message}`);
         });
     };
 };
 
 net.createServer(socketHandler(PORT_4000))
     .listen(PORT_4000, HOST)
     .on('listening', () => {
         console.log(`\nStarted server: ${HOST}:${PORT_4000}`);
     });
 
 net.createServer(socketHandler(PORT_5000))
     .listen(PORT_5000, HOST)
     .on('listening', () => {
         console.log(`Started server: ${HOST}:${PORT_5000}\n`);
     });
 