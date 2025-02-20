const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });

const square = (params) => {
    if (params.length === 1) {
        return Math.PI * params[0] * params[0];
    } else if (params.length === 2) {
        return params[0] * params[1];
    }
    throw new Error('invalid parameters');
};

const sum = (params) => params.reduce((acc, val) => acc + val, 0);

const mul = (params) => params.reduce((acc, val) => acc * val, 1);

const fib = (params) => {
    const n = params[0];
    if (n < 0) throw new Error('invalid parameter');
    const result = [0, 1];
    for (let i = 2; i < n; i++) {
        result.push(result[i - 1] + result[i - 2]);
    }
    return result.slice(0, n);
};

const fact = (params) => {
    const n = params[0];
    if (n < 0) throw new Error('invalid parameter');
    if (n === 0) return 1;
    return n * fact([n - 1]);
};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const { method, params } = JSON.parse(message);
            let result;
            switch (method) {
                case 'square':
                    result = square(params);
                    break;
                case 'sum':
                    result = sum(params);
                    break;
                case 'mul':
                    result = mul(params);
                    break;
                case 'fib':
                    result = fib(params);
                    break;
                case 'fact':
                    result = fact(params);
                    break;
                default:
                    throw new Error('unknown method');
            }
            ws.send(JSON.stringify({ result }));
        } catch (err) {
            ws.send(JSON.stringify({ error: err.message }));
        }
    });
});

console.log('websocket server running on ws://localhost:4000');
