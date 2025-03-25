async function encrypt() {
    const text = document.getElementById('text').value;
    const cipher = document.getElementById('cipher').value;

    try {
        const response = await fetch('http://localhost:3000/encrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, cipher }),
        });

        const data = await response.json();
        document.getElementById('result').innerText = data.result;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerText = 'Произошла ошибка при шифровании.';
    }
}

async function decrypt() {
    const text = document.getElementById('text').value;
    const cipher = document.getElementById('cipher').value;

    try {
        const response = await fetch('http://localhost:3000/decrypt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, cipher }),
        });

        const data = await response.json();
        document.getElementById('result').innerText = data.result;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerText = 'Произошла ошибка при расшифровании.';
    }
}

async function encryptFile() {
    const fileInput = document.getElementById('file');
    const cipher = document.getElementById('cipher').value;

    if (fileInput.files.length === 0) {
        alert('Пожалуйста, выберите файл.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('cipher', cipher);

    try {
        const response = await fetch('http://localhost:3000/encrypt-file', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        document.getElementById('result').innerText = data.result;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerText = 'Произошла ошибка при шифровании файла.';
    }
}

async function decryptFile() {
    const fileInput = document.getElementById('file');
    const cipher = document.getElementById('cipher').value;

    if (fileInput.files.length === 0) {
        alert('Пожалуйста, выберите файл.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('cipher', cipher);

    try {
        const response = await fetch('http://localhost:3000/decrypt-file', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        document.getElementById('result').innerText = data.result;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerText = 'Произошла ошибка при расшифровании файла.';
    }
}