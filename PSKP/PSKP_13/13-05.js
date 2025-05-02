/*8. Разработайте приложение 13-05, представляющее собой TCP-сервер. Сервер должен через TCP-соединение  принимать поток 32-битовых чисел 
(по одному числу за каждую оправку клиентом). Сервер суммирует полученные числа и каждые 5 сек. отправляет клиенту полученную (промежуточную) 
сумму. Сервер обеспечивает каждому подключенному клиенту получение правильных промежуточных сумм чисел, оправленных клиентом серверу. 
Сервер должен обеспечивать вывод на консоль диагностических сообщений, позволяющих проверить корректность его работы.  */
const net = require('net');
const HOST = '127.0.0.1';
const PORT = 4000;
let label = (pfx, socket) => {
    return `${pfx} ${socket.remoteAddress}:${socket.remotePort} -> `;
};
let connections = new Map();
let server = net.createServer();

server.on('connection', (socket) => {
    let intervalWriteNumber = null;
    console.log(
        `Client connected:  ${socket.remoteAddress}:${socket.remotePort}\n`
    );

    socket.id = new Date().toISOString();
    connections.set(socket.id, 0); 
    console.log('Socket ID: ', socket.id);

    server.getConnections((error, conn) => {
        if (!error) {
            console.log(label('CONNECTED', socket) + conn);
            for (let [key, value] of connections) {
                console.log(key, value);
            }
            console.log();
        }
    });

    socket.on('data', (data) => {
        console.log(label('DATA', socket) + data.readInt32LE());
        connections.set(
            socket.id,
            connections.get(socket.id) + data.readInt32LE()
        );
        console.log(`SUM: ${connections.get(socket.id)}`);
    });

    let buf = Buffer.alloc(4);
    setTimeout(() => {
        intervalWriteNumber = setInterval(() => {
            buf.writeInt32LE(connections.get(socket.id), 0);
            socket.write(buf);
        }, 5000);
    }, 500);

    socket.on('close', () => {
        console.log(label('CLOSED', socket) + socket.id);
        clearInterval(intervalWriteNumber);
        connections.delete(socket.id);
    });

    socket.on('error', (error) => {
        console.log(label('ERROR', socket) + error.message);
        clearInterval(intervalWriteNumber);
        connections.delete(socket.id);
    });
});

server.on('listening', () => {
    console.log(`\nStarted server:    ${HOST}:${PORT}`);
});
server.on('error', (error) => {
    console.log(`[ERROR] Server: ${error.message}`);
});
server.listen(PORT, HOST);
