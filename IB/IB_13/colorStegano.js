const fs = require('fs-extra');

class ColorStegano {
    constructor() {
        this.color0 = '<span style="color: #00FF00">'; 
        this.color1 = '<span style="color: #FF00FF">'; 
        this.resetColor = '</span>';
        this.htmlHeader = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family: monospace; font-size: 16px; line-height: 1.5;}</style></head><body>';
        this.htmlFooter = '</body></html>';
    }

    async embed(message, inputFile, outputFile) {
        try {
            let text = await fs.readFile(inputFile, 'utf-8');
            const binaryMessage = this.textToBinary(message);
            let textChars = text.split('');
            
            if (binaryMessage.length > textChars.length) {
                throw new Error('Сообщение слишком длинное для данного файла');
            }

            const step = Math.max(1, Math.floor(textChars.length / binaryMessage.length));
            
            for (let i = 0; i < binaryMessage.length; i++) {
                const pos = Math.min(i * step, textChars.length - 1);
                const bit = binaryMessage[i];
                textChars[pos] = (bit === '1' ? this.color1 : this.color0) + 
                                textChars[pos] + 
                                this.resetColor;
            }

            const result = this.htmlHeader + textChars.join('') + this.htmlFooter;
            await fs.writeFile(outputFile, result);
            console.log(`Сообщение успешно встроено в ${outputFile}`);
            console.log(`Откройте файл в браузере для просмотра цветов`);
            return true;
        } catch (error) {
            console.error(`Ошибка при встраивании: ${error.message}`);
            return false;
        }
    }

    async extract(inputFile) {
        try {
            const text = await fs.readFile(inputFile, 'utf-8');
            let binaryMessage = '';
            let i = 0;

            i = text.indexOf('<body>') + 6;

            while (i < text.length) {
                if (text.startsWith(this.color0, i)) {
                    binaryMessage += '0';
                    i += this.color0.length;
                } else if (text.startsWith(this.color1, i)) {
                    binaryMessage += '1';
                    i += this.color1.length;
                } else if (text.startsWith(this.resetColor, i)) {
                    i += this.resetColor.length;
                } else {
                    i++;
                }
            }

            const message = this.binaryToText(binaryMessage);
            console.log(`Извлеченное сообщение: ${message}`);
            return message;
        } catch (error) {
            console.error(`Ошибка при извлечении: ${error.message}`);
            return null;
        }
    }

    textToBinary(text) {
        return text.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');
    }

    binaryToText(binary) {
        const bytes = binary.match(/.{1,8}/g) || [];
        return bytes.map(byte => 
            String.fromCharCode(parseInt(byte, 2))
        ).join('').replace(/\x00/g, ''); 
    }
}

module.exports = ColorStegano;