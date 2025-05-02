/* 9. Разработайте клиент 13-06, представляющее собой TCP-клиент. Клиент принимает 1 числовой параметр (число X) через  командную строку.  
Клиент через TCP-соединение оправляет 1 раз в секунду серверу 32-битовое число X. Клиент принимает от сервера промежуточные суммы и выводит 
их на консоль. */
const net = require('net');
const HOST = '127.0.0.1';
const PORT = 4000;
let number = process.argv[2] ? process.argv[2] : 1;
let client = new net.Socket();
let buffer = new Buffer.alloc(4);

setTimeout(() => {
    client.connect(PORT, HOST, () => {
        console.log(
            `\nConnected to server: ${client.remoteAddress}:${client.remotePort}\nPORT: ${PORT}\nNUMBER: ${number}`
        );

        let intervalWriteNumber = setInterval(() => {
            client.write((buffer.writeInt32LE(number, 0), buffer));
        }, 1000);

        setTimeout(() => {
            clearInterval(intervalWriteNumber);
            client.end();
        }, 21000);
    });

    client.on('data', (data) => {
        console.log(`Client received: ${data.readInt32LE()}`);
    });
    client.on('close', () => {
        console.log('Connection closed.');
    });
    client.on('error', (error) => {
        console.log('[ERROR] ' + error.message);
    });
}, 500);
