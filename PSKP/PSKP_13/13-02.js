/*2. Разработайте приложение 13-02, представляющее собой  TCP-клиент, проверяющий  работоспособность сервера 13-01.*/
const net = require('net');

const HOST = '127.0.0.1';
const PORT = 4000;
const MESSAGE = '13-02!';

const client = new net.Socket();

client.connect(PORT, HOST, () => {
    console.log(`connected to server: ${HOST}:${PORT}`);
    client.write(MESSAGE);
});

client.on('data', (data) => {
    console.log(`client received: ${data.toString()}`);
    client.destroy();
});

client.on('close', () => {
    console.log(`connection closed.`);
});

client.on('error', (error) => {
    console.log(`[ERROR] ${error.message}`);
});
