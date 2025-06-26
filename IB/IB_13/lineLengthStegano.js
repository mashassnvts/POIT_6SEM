const fs = require('fs-extra');

class LineLengthStegano {
    constructor() {
        this.bitSeparator = ' '; 
    }

    async embed(message, inputFile, outputFile) {
        try {
            let text = await fs.readFile(inputFile, 'utf-8');
            let lines = text.split('\n');
            
            const nonEmptyLines = lines.map((line, index) => ({
                content: line.trim(),
                originalIndex: index
            })).filter(item => item.content !== '');
            
            const binaryMessage = this.textToBinary(message);
            
            console.log(`Бинарное сообщение: ${binaryMessage}`);
            console.log(`Количество непустых строк: ${nonEmptyLines.length}`);
            
            if (binaryMessage.length > nonEmptyLines.length) {
                throw new Error(`Нужно ${binaryMessage.length} строк, но найдено только ${nonEmptyLines.length} непустых строк`);
            }

            for (let i = 0; i < binaryMessage.length; i++) {
                const originalIndex = nonEmptyLines[i].originalIndex;
                const bit = binaryMessage[i];
                lines[originalIndex] = nonEmptyLines[i].content + (bit === '1' ? this.bitSeparator : '');
            }

            await fs.writeFile(outputFile, lines.join('\n'));
            console.log(`Сообщение встроено в ${outputFile}`);
            return true;
        } catch (error) {
            console.error(`Ошибка: ${error.message}`);
            return false;
        }
    }

    async extract(inputFile) {
        try {
            const text = await fs.readFile(inputFile, 'utf-8');
            const lines = text.split('\n');
            let binaryMessage = '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed !== '') {
                    binaryMessage += line.endsWith(this.bitSeparator) ? '1' : '0';
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

module.exports = LineLengthStegano;