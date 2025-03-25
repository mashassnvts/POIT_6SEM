const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Алфавит для шифра Цезаря
const caesarAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

function createCaesarKeyAlphabet(keyword) {
    const uniqueChars = [...new Set(keyword.toLowerCase())];
    const remainingChars = caesarAlphabet.split('').filter(char => !uniqueChars.includes(char));
    return uniqueChars.join('') + remainingChars.join('');
}

function caesarCipher(text, encrypt = true) {
    const keyAlphabet = createCaesarKeyAlphabet('безопасность');
    const key = 3;
    let result = '';

    for (let char of text.toLowerCase()) {
        const index = keyAlphabet.indexOf(char);
        if (index === -1) {
            result += char;
        } else {
            const newIndex = encrypt ? (index + key) % keyAlphabet.length : (index - key + keyAlphabet.length) % keyAlphabet.length;
            result += keyAlphabet[newIndex];
        }
    }

    return result;
}

// Трисемус
const alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя'.split('');

function removeDuplicates(keyword) {
    const keywordList = [];
    const remainingAlphabet = [...alphabet];

    for (const char of keyword) {
        if (!keywordList.includes(char)) {
            keywordList.push(char);
        }
        const index = remainingAlphabet.indexOf(char);
        if (index !== -1) {
            remainingAlphabet.splice(index, 1);
        }
    }
    return [...keywordList, ...remainingAlphabet];
}

function formTable(keyword) {
    const combinedAlphabet = removeDuplicates(keyword);
    const table = [];
    while (combinedAlphabet.length) {
        table.push(combinedAlphabet.splice(0, 4));
    }
    return table;
}

function trithemiusEncrypt(keyword, text) {
    let result = '';
    const table = formTable(keyword);

    for (const char of text) {
        let encodedChar = char;
        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            const colIndex = row.indexOf(char);
            if (colIndex !== -1) {
                encodedChar = table[(i + 1) % table.length][colIndex];
                break;
            }
        }
        result += encodedChar;
    }

    return result;
}

function trithemiusDecrypt(keyword, text) {
    let result = '';
    const table = formTable(keyword);

    for (const char of text) {
        let decodedChar = char;
        for (let i = 0; i < table.length; i++) {
            const row = table[i];
            const colIndex = row.indexOf(char);
            if (colIndex !== -1) {
                decodedChar = table[(i - 1 + table.length) % table.length][colIndex];
                break;
            }
        }
        result += decodedChar;
    }

    return result;
}

// API
app.post('/encrypt', (req, res) => {
    const { text, cipher } = req.body;
    let result;

    const startTime = performance.now(); // Начало замера времени

    if (cipher === 'caesar') {
        result = caesarCipher(text);
    } else if (cipher === 'trithemius') {
        result = trithemiusEncrypt('ключ', text);
    }

    const endTime = performance.now(); // Конец замера времени
    const executionTime = endTime - startTime; // Время выполнения в миллисекундах

    res.json({ result, executionTime }); // Возвращаем результат и время выполнения
});

app.post('/decrypt', (req, res) => {
    const { text, cipher } = req.body;
    let result;

    const startTime = performance.now(); // Начало замера времени

    if (cipher === 'caesar') {
        result = caesarCipher(text, false);
    } else if (cipher === 'trithemius') {
        result = trithemiusDecrypt('ключ', text);
    }

    const endTime = performance.now(); // Конец замера времени
    const executionTime = endTime - startTime; // Время выполнения в миллисекундах

    res.json({ result, executionTime }); // Возвращаем результат и время выполнения
});
app.post('/encrypt-file', upload.single('file'), (req, res) => {
    const cipher = req.body.cipher;
    const filePath = req.file.path;

    const startTime = performance.now(); // Начало замера времени

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла' });
        }

        let result;
        if (cipher === 'caesar') {
            result = caesarCipher(data);
        } else if (cipher === 'trithemius') {
            result = trithemiusEncrypt('ключ', data);
        }

        const endTime = performance.now(); // Конец замера времени
        const executionTime = endTime - startTime; // Время выполнения в миллисекундах

        fs.unlinkSync(filePath);
        res.json({ result, executionTime }); // Возвращаем результат и время выполнения
    });
});

app.post('/decrypt-file', upload.single('file'), (req, res) => {
    const cipher = req.body.cipher;
    const filePath = req.file.path;

    const startTime = performance.now(); // Начало замера времени

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при чтении файла' });
        }

        let result;
        if (cipher === 'caesar') {
            result = caesarCipher(data, false);
        } else if (cipher === 'trithemius') {
            result = trithemiusDecrypt('ключ', data);
        }

        const endTime = performance.now(); // Конец замера времени
        const executionTime = endTime - startTime; // Время выполнения в миллисекундах

        fs.unlinkSync(filePath);
        res.json({ result, executionTime }); // Возвращаем результат и время выполнения
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
