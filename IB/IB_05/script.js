document.getElementById('method').addEventListener('change', function() {
    const method = this.value;
    document.getElementById('spiralParams').style.display = method === 'spiral' ? 'flex' : 'none';
    document.getElementById('multipleParams').style.display = method === 'multiple' ? 'flex' : 'none';
});

function encrypt() {
    const startTime = performance.now();
    processText('encrypt');
    const time = performance.now() - startTime;
    document.getElementById('encryptBtn').textContent = `Зашифровать (${time.toFixed(0)} мс)`;
}

function decrypt() {
    const startTime = performance.now();
    processText('decrypt');
    const time = performance.now() - startTime;
    document.getElementById('decryptBtn').textContent = `Расшифровать (${time.toFixed(0)} мс)`;
}

function calculateTableSize(textLength) {
    let size = Math.ceil(Math.sqrt(textLength));
    
    for (let i = size; i >= 2; i--) {
        if (textLength % i === 0) {
            return {
                rows: i,
                cols: textLength / i
            };
        }
    }
    
    return {
        rows: size,
        cols: Math.ceil(textLength / size)
    };
}

function processText(action) {
    const text = document.getElementById('text').value.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
    
    if (text.length < 500) {
        alert('Текст должен содержать не менее 500 символов!');
        return;
    }

    const originalFrequency = calculateCharacterFrequency(text);
    renderHistogram(originalFrequency, 'originalHistogram');

    const method = document.getElementById('method').value;
    let result;
    
    if (method === 'spiral') {
        const {rows, cols} = calculateTableSize(text.length);
        document.getElementById('rows').value = rows;
        document.getElementById('cols').value = cols;
        
        result = action === 'encrypt' 
            ? spiralEncrypt(text, rows, cols) 
            : spiralDecrypt(text, rows, cols);
    } else {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        result = action === 'encrypt' 
            ? multipleEncrypt(text, firstName, lastName) 
            : multipleDecrypt(text, firstName, lastName);
    }

    document.getElementById('result').textContent = result;
    
    const resultFrequency = calculateCharacterFrequency(result);
    renderHistogram(resultFrequency, 'encryptedHistogram');
}

function processFile(action) {
    const startTime = performance.now();
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Пожалуйста, выберите файл');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
        if (content.length < 500) {
            alert('Файл должен содержать не менее 500 символов!');
            return;
        }

        const originalFrequency = calculateCharacterFrequency(content);
        renderHistogram(originalFrequency, 'originalHistogram');

        const method = document.getElementById('method').value;
        let result;
        
        if (method === 'spiral') {
            const {rows, cols} = calculateTableSize(content.length);
            document.getElementById('rows').value = rows;
            document.getElementById('cols').value = cols;
            
            result = action === 'encrypt' 
                ? spiralEncrypt(content, rows, cols) 
                : spiralDecrypt(content, rows, cols);
        } else {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            result = action === 'encrypt' 
                ? multipleEncrypt(content, firstName, lastName) 
                : multipleDecrypt(content, firstName, lastName);
        }

        const time = performance.now() - startTime;
        if (action === 'encrypt') {
            document.getElementById('encryptFileBtn').textContent = `Зашифровать файл (${time.toFixed(0)} мс)`;
        } else {
            document.getElementById('decryptFileBtn').textContent = `Расшифровать файл (${time.toFixed(0)} мс)`;
        }

        document.getElementById('result').textContent = result;
        
        const resultFrequency = calculateCharacterFrequency(result);
        renderHistogram(resultFrequency, 'encryptedHistogram');
        
        downloadResult(result, action === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt');
    };
    reader.readAsText(file, 'UTF-8');
}

function downloadResult(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function spiralEncrypt(text, rows, cols) {
    const cleanText = text.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
    const totalCells = rows * cols;
    const paddedText = cleanText.padEnd(totalCells, ' ');
    
    const table = [];
    for (let i = 0; i < rows; i++) {
        table.push(paddedText.substr(i * cols, cols).split(''));
    }
    
    let result = [];
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    
    while (top <= bottom && left <= right) {
        for (let i = right; i >= left; i--) {
            result.push(table[top][i]);
        }
        top++;
        
        for (let i = top; i <= bottom; i++) {
            result.push(table[i][left]);
        }
        left++;
        
        if (top <= bottom) {
            for (let i = left; i <= right; i++) {
                result.push(table[bottom][i]);
            }
            bottom--;
        }
        
        if (left <= right) {
            for (let i = bottom; i >= top; i--) {
                result.push(table[i][right]);
            }
            right--;
        }
    }
    
    return result.join('');
}

function spiralDecrypt(text, rows, cols) {
    const cleanText = text.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
    const totalCells = rows * cols;
    const paddedText = cleanText.padEnd(totalCells, ' ');
    
    const table = Array(rows).fill().map(() => Array(cols).fill(''));
    
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
    let index = 0;
    
    while (top <= bottom && left <= right) {
        for (let i = right; i >= left; i--) {
            if (index < paddedText.length) {
                table[top][i] = paddedText[index++];
            }
        }
        top++;
        
        for (let i = top; i <= bottom; i++) {
            if (index < paddedText.length) {
                table[i][left] = paddedText[index++];
            }
        }
        left++;
        
        if (top <= bottom) {
            for (let i = left; i <= right; i++) {
                if (index < paddedText.length) {
                    table[bottom][i] = paddedText[index++];
                }
            }
            bottom--;
        }
        
        if (left <= right) {
            for (let i = bottom; i >= top; i--) {
                if (index < paddedText.length) {
                    table[i][right] = paddedText[index++];
                }
            }
            right--;
        }
    }
    
    let result = [];
    for (let i = 0; i < rows; i++) {
        result.push(table[i].join(''));
    }
    
    return result.join('');
}

function multipleEncrypt(text, firstName, lastName) {
    const cleanText = text.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
    const key1 = firstName.toLowerCase().replace(/[^а-яё]/g, '');
    const key2 = lastName.toLowerCase().replace(/[^а-яё]/g, '');
    
    if (!key1 || !key2) {
        alert('Имя и фамилия должны содержать только буквы русского алфавита');
        return '';
    }
    
    const table1 = createPermutationTable(cleanText, key1);
    const order1 = getColumnOrder(key1);
    const firstPass = readColumnsByOrder(table1, order1);
    
    const table2 = createPermutationTable(firstPass, key2);
    const order2 = getColumnOrder(key2);
    return readColumnsByOrder(table2, order2);
}

function multipleDecrypt(text, firstName, lastName) {
    const cleanText = text.replace(/[^а-яА-ЯёЁ ]/g, '').toLowerCase();
    const key1 = firstName.toLowerCase().replace(/[^а-яё]/g, '');
    const key2 = lastName.toLowerCase().replace(/[^а-яё]/g, '');
    
    if (!key1 || !key2) {
        alert('Имя и фамилия должны содержать только буквы русского алфавита');
        return '';
    }
    
    const order2 = getColumnOrder(key2);
    const table2 = reconstructDecryptionTable(cleanText, key2.length, order2);
    const firstPass = readTableByRows(table2);
    
    const order1 = getColumnOrder(key1);
    const table1 = reconstructDecryptionTable(firstPass, key1.length, order1);
    return readTableByRows(table1);
}

function reconstructDecryptionTable(text, cols, columnOrder) {
    const rows = Math.ceil(text.length / cols);
    const table = Array(rows).fill().map(() => Array(cols).fill(''));
    
    const reverseOrder = Array(cols).fill(0);
    columnOrder.forEach((newPos, originalPos) => {
        reverseOrder[newPos] = originalPos;
    });
    
    const colLengths = Array(cols).fill(0);
    for (let i = 0; i < cols; i++) {
        colLengths[i] = rows;
    }
    
    let currentPos = 0;
    for (let col = 0; col < cols; col++) {
        const originalCol = reverseOrder[col];
        for (let row = 0; row < rows; row++) {
            if (currentPos < text.length) {
                table[row][originalCol] = text[currentPos++];
            } else {
                table[row][originalCol] = ' ';
            }
        }
    }
    
    return table;
}

function createPermutationTable(text, key) {
    const cols = key.length;
    const rows = Math.ceil(text.length / cols);
    const table = [];
    
    for (let i = 0; i < rows; i++) {
        const start = i * cols;
        const end = start + cols;
        const row = text.slice(start, end).split('');
        while (row.length < cols) {
            row.push(' ');
        }
        table.push(row);
    }
    
    return table;
}

function getColumnOrder(key) {
    const chars = key.split('').map((char, index) => ({char, originalIndex: index}));
    
    chars.sort((a, b) => {
        if (a.char === b.char) {
            return a.originalIndex - b.originalIndex;
        }
        return a.char.localeCompare(b.char);
    });
    
    const order = Array(key.length);
    chars.forEach((item, newIndex) => {
        order[item.originalIndex] = newIndex;
    });
    
    return order;
}

function readColumnsByOrder(table, order) {
    let result = '';
    const reverseOrder = Array(order.length);
    order.forEach((newPos, originalPos) => {
        reverseOrder[newPos] = originalPos;
    });
    
    for (let newCol = 0; newCol < order.length; newCol++) {
        const originalCol = reverseOrder[newCol];
        for (let row = 0; row < table.length; row++) {
            result += table[row][originalCol] || ' ';
        }
    }
    
    return result;
}

function readTableByRows(table) {
    let result = '';
    for (const row of table) {
        result += row.join('');
    }
    return result.replace(/\s+$/g, '');
}

function calculateCharacterFrequency(text) {
    const frequency = {};
    const russianLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя ';
    
    for (const char of russianLetters) {
        frequency[char] = 0;
    }
    
    for (const char of text.toLowerCase()) {
        if (russianLetters.includes(char)) {
            frequency[char]++;
        }
    }
    
    return frequency;
}

function renderHistogram(frequency, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    const sortedEntries = Object.entries(frequency).sort((a, b) => a[0].localeCompare(b[0]));
    const maxValue = Math.max(...Object.values(frequency));
    
    sortedEntries.forEach(([char, count]) => {
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        const height = maxValue > 0 ? (count / maxValue) * 100 : 0;
        bar.style.height = `${height}%`;
        
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = count;
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = char === ' ' ? 'пробел' : char;
        
        bar.appendChild(barValue);
        barContainer.appendChild(bar);
        barContainer.appendChild(barLabel);
        container.appendChild(barContainer);
    });
}