/*Разработайте приложение 13-03, представляющее собой TCP-сервер. Сервер должен через TCP-соединение  принимать поток 32-битовых чисел 
(по одному числу за каждую оправку клиентом). Сервер суммирует полученные числа и каждые 5 сек. отправляет клиенту полученную (промежуточную) 
сумму.   */
const net = require('net');
const HOST = '127.0.0.1';
const PORT = 4000;
let sum = 0;


let server = net.createServer();

server.on('connection', (socket) => {
    console.log(`\nClient connected: ${socket.remoteAddress}:${socket.remotePort}`);


    socket.on('data', (data) => {

        sum += data.readInt32LE();
        console.log(`Server received: ${data}, sum = ${sum}`);
    });


    let buf = Buffer.alloc(4);


    setInterval(() => {
        buf.writeInt32LE(sum, 0);
        socket.write(buf);
        console.log(`Sent sum: ${sum}`);
    }, 5000);

    socket.on('close', () => {
        console.log('Connection closed.');
    });

    socket.on('error', (error) => {
        console.log('[ERROR] Server: ' + error.message);
    });
});

server.on('error', (error) => {
    console.log('[ERROR] Server: ' + error.message);
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});
