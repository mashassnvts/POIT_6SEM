const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(__dirname));

const wasmBuffer = fs.readFileSync(path.join(__dirname, 'func.wasm'));

async function loadWasm() {
    const wasmModule = await WebAssembly.instantiate(wasmBuffer);
    return wasmModule.instance.exports;
}

app.get('/sum/:a/:b', async (req, res) => {
    const { a, b } = req.params;
    const wasmExports = await loadWasm();
    const result = wasmExports.sum(parseInt(a), parseInt(b));
    res.send(`sum(${a}, ${b}) = ${result}`);
});

app.get('/mul/:a/:b', async (req, res) => {
    const { a, b } = req.params;
    const wasmExports = await loadWasm();
    const result = wasmExports.mul(parseInt(a), parseInt(b));
    res.send(`mul(${a}, ${b}) = ${result}`);
});

app.get('/sub/:a/:b', async (req, res) => {
    const { a, b } = req.params;
    const wasmExports = await loadWasm();
    const result = wasmExports.sub(parseInt(a), parseInt(b));
    res.send(`sub(${a}, ${b}) = ${result}`);
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/index.html`);
});