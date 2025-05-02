const redis = require('redis');

const publisher = redis.createClient({ url: 'redis://127.0.0.1:6379' });

(async () => {
    try {
        await publisher.connect();
        console.log('publisher connected to Redis');

        const channel = 'my_channel';
        const messages = ['HELLO', 'MY FRIEND', 'SMELOVVV'];

        for (const message of messages) {
            console.log(`Publishing: ${message}`);
            await publisher.publish(channel, message);
        }

        await publisher.quit();
        console.log('Publisher disconnected');
    } catch (err) {
        console.error('Error:', err);
        await publisher.quit();
    }
})();
