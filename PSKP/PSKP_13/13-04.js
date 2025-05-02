/*6. Разработайте приложение 13-04, представляющее собой TCP-клиент. Клиент через TCP-соединение оправляет 1 раз в секунду серверу 
32-битовое число. Клиент принимает от сервера промежуточные суммы и выводит их на консоль. Клиент должен автоматически остановиться 
через 20 сек.    */
const net = require('net');
const HOST = '127.0.0.1';
const PORT = 4000;

let client = new net.Socket();
let buffer = Buffer.alloc(4); 

setTimeout(() => {
    client.connect(PORT, HOST, () => {
        let k = 1;
        console.log(`\nConnected to server: ${client.remoteAddress}:${client.remotePort}`);

        // Отправляем число каждую секунду
        let intervalWriteNumber = setInterval(() => {
            buffer.writeInt32LE(k++, 0);  
            client.write(buffer);        
            console.log(`Client sent: ${k - 1}`);
        }, 1000);

        // Останавливаем клиента через 20 секунд
        setTimeout(() => {
            clearInterval(intervalWriteNumber);  
            client.end();                      
            console.log("Client stopped after 20 seconds.");
        }, 20000);
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
