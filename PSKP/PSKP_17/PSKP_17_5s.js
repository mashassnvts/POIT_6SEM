const redis = require('redis');

const subscriber = redis.createClient({ url: 'redis://127.0.0.1:6379' });

(async () => {
    try {
        await subscriber.connect();
        console.log('Subscriber connected to Redis');

        const channel = 'my_channel';

        await subscriber.subscribe(channel, (message) => {
            console.log(`Received message: ${message}`);
        });
    } catch (err) {
        console.error('Error:', err);
        await subscriber.quit();
    }
})();
