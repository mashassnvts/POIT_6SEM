const redis = require('redis');
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

(async () => {
    try {
        await client.connect();
        console.log('connected to redis');

        const numoperations = 10000;
        const measure = async (operation,  action) => {
            const start = Date.now();
            for (let i = 0; i < numoperations; i++) {
                await action(i);
    }
    return Date.now() - start;
};

const settime = await measure('set', (i) => client.set(`key${i}`, `value${i}`));
const gettime = await measure('get', (i) => client.get(`key${i}`));
const deltime = await measure('del', (i) => client.del(`key${i}`));

console.log(`set ${settime} ms`);
console.log(`get ${gettime} ms`);
console.log(`del ${deltime} ms`);

await client.quit();
    }
    catch (err) { console.log('error',err);
        await client.quit();
     }
    })();
