const crypto = require('crypto');
const { performance } = require('perf_hooks');
const fs = require('fs');
const QuickChart = require('quickchart-js');

function generatePrimesInRange(start, end, count) {
    const primes = [];

    function isPrime(num) {
        if (num < 2) return false;
        for (let i = 2, sqrt = Math.sqrt(num); i <= sqrt; i++) {
            if (num % i === 0) return false;
        }
        return true;
    }

    let current = start;
    while (primes.length < count && current <= end) {
        if (isPrime(current)) primes.push(BigInt(current));
        current++;
    }
    return primes;
}

function generateBigNumber(bits) {
    const bytes = Math.ceil(bits / 8);
    let number;
    do {
        number = BigInt('0x' + crypto.randomBytes(bytes).toString('hex'));
    } while (number % 2n === 0n); 
    return number;
}

function modularExponentiation(base, exponent, mod) {
    let result = 1n;
    base = base % mod;
    while (exponent > 0) {
        if (exponent % 2n === 1n) {
            result = (result * base) % mod;
        }
        exponent = exponent / 2n;
        base = (base * base) % mod;
    }
    return result;
}

(async () => {
    const aValues = [5n, 15n, 25n, 35n]; 
    const primesX = generatePrimesInRange(103, 1000, 5); 
    const nValues = [generateBigNumber(1024), generateBigNumber(2048)];

    const resultsByA = []; 
    const resultsByX = [];
    const resultsByN = []; 

    for (const x of primesX) {
        for (const n of nValues) {
            for (const a of aValues) {
                const start = performance.now();
                modularExponentiation(a, x, n); 
                const end = performance.now();

                const time = (end - start).toFixed(3);
                resultsByA.push({ a: a.toString(), time: parseFloat(time), x: x.toString(), nBits: n.toString(2).length });
            }
        }
    }

    for (const a of aValues) {
        for (const n of nValues) {
            for (const x of primesX) {
                const start = performance.now();
                modularExponentiation(a, x, n); 
                const end = performance.now();

                const time = (end - start).toFixed(3);
                resultsByX.push({ a: a.toString(), time: parseFloat(time), x: x.toString(), nBits: n.toString(2).length });
            }
        }
    }

    for (const a of aValues) {
        for (const x of primesX) {
            for (const n of nValues) {
                const start = performance.now();
                modularExponentiation(a, x, n); 
                const end = performance.now();

                const time = (end - start).toFixed(3);
                resultsByN.push({ a: a.toString(), time: parseFloat(time), x: x.toString(), nBits: n.toString(2).length });
            }
        }
    }

    const chartA = new QuickChart();
    chartA.setConfig({
        type: 'line',
        data: {
            labels: resultsByA.map((r) => `a=${r.a}, x=${r.x}, n=${r.nBits} bits`),
            datasets: [{
                label: 'Execution Time (ms) by a',
                data: resultsByA.map((r) => r.time),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Parameters' } },
                y: { title: { display: true, text: 'Execution Time (ms)' } }
            }
        }
    });

    const chartX = new QuickChart();
    chartX.setConfig({
        type: 'line',
        data: {
            labels: resultsByX.map((r) => `a=${r.a}, x=${r.x}, n=${r.nBits} bits`),
            datasets: [{
                label: 'Execution Time (ms) by x',
                data: resultsByX.map((r) => r.time),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Parameters' } },
                y: { title: { display: true, text: 'Execution Time (ms)' } }
            }
        }
    });

    const chartN = new QuickChart();
    chartN.setConfig({
        type: 'line',
        data: {
            labels: resultsByN.map((r) => `a=${r.a}, x=${r.x}, n=${r.nBits} bits`),
            datasets: [{
                label: 'Execution Time (ms) by n',
                data: resultsByN.map((r) => r.time),
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: { title: { display: true, text: 'Parameters' } },
                y: { title: { display: true, text: 'Execution Time (ms)' } }
            }
        }
    });

    await chartA.toFile('chartA.png');
    await chartX.toFile('chartX.png');
    await chartN.toFile('chartN.png');

    console.log('Graphs saved as chartA.png, chartX.png, and chartN.png');
})();
