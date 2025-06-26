const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

function generateSequence(z, length = 200) {
    let sequence = [];
    let sum = BigInt(0);

    for (let i = 0; i < length; i++) {
        let nextValue = sum + BigInt(Math.floor(Math.random() * Math.pow(2, z)) + 1);
        if (i === length - 1) {
            nextValue = sum + (BigInt(2n) ** BigInt(100)); 
        }
        sequence.push(nextValue);
        sum += nextValue;
    }

    return sequence;
}

function generateNormalSequence(superSequence) {
    const M = superSequence.reduce((a, b) => a + BigInt(b), BigInt(0)) + BigInt(1);
    let W;

    do {
        W = BigInt(Math.floor(Math.random() * Number(M - BigInt(1))) + 1);
    } while (gcd(W, M) !== BigInt(1));

    const normalSequence = superSequence.map(si => ((BigInt(si) * W) % M));

    return { normalSequence: normalSequence.map(n => n.toString()), M: M.toString(), W: W.toString() };
}

// НОД
function gcd(a, b) {
    a = BigInt(a);
    b = BigInt(b);
    return b === BigInt(0) ? a : gcd(b, a % b);
}

// Обратное число по модулю
function modularInverse(a, m) {
    a = BigInt(a);
    m = BigInt(m);
    let m0 = m, t, q;
    let x0 = BigInt(0), x1 = BigInt(1);

    if (m === BigInt(1)) return BigInt(0);

    while (a > BigInt(1)) {
        q = a / m;
        t = m;
        m = a % m;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }

    if (x1 < BigInt(0)) x1 += m0;

    return x1;
}

app.post('/generate-keys', (req, res) => {
    const { z } = req.body;
    const superSequence = generateSequence(z);
    const { normalSequence, M, W } = generateNormalSequence(superSequence);
    res.json({ 
        superSequence: superSequence.map(n => n.toString()), 
        normalSequence, 
        M, 
        W,
        sequenceLength: normalSequence.length 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});