const fs = require("fs");

const polishAlphabet = "aąbcćdeęfghijklłmnńoóprsśtuwyzźż";
const belarusianAlphabet = "абвгдеёжзійклмнопрстуўфхцчшщьыэюя";

const polishFilePath = "./polish.txt"; 
const belarusianFilePath = "./belarus.txt"; 

function calculateFrequencies(text, alphabet) {
    const frequencies = {};
    const filteredText = text.split("").filter((char) => alphabet.includes(char));

    filteredText.forEach((char) => {
        frequencies[char] = (frequencies[char] || 0) + 1;
    });

    return frequencies;
}

function entropyy(frequencies, totalChars) {
    let entropy = 0;
    for (const char in frequencies) {
        const probability = frequencies[char] / totalChars;
        entropy -= probability * Math.log2(probability);
    }
    return entropy;
}

function analyzeText(filePath, alphabet, language) {
    try {
        const text = fs.readFileSync(filePath, "utf-8");
        const frequencies = calculateFrequencies(text, alphabet);
        const totalChars = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0);

        console.log(`\nязык: ${language}`);
        console.log("частоты символов:", frequencies);

        const entropy = entropyy(frequencies, totalChars);
        console.log(`энтропия алфавита (${language}):`, entropy.toFixed(4));
        return entropy; 

    } catch (error) {
        console.error(`ошибка чтения файла для ${language}:`, error.message);
    }
}


function calculateBinaryEntropyWithErrors(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        let binaryString = buffer.toString('hex');
        binaryString = binaryString.split("").map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join("");

        const frequencies = calculateFrequencies(binaryString, "01");
        const totalChars = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0);

        const entropy = entropyy(frequencies, totalChars);
        // console.log("энтропия бинарного алфавита:", entropy.toFixed(4));

        const errorProbabilities = [0.1, 0.5, 1.0];
        errorProbabilities.forEach((errorProbability) => {
            const errorImpact = calculateErrorImpact(entropy, errorProbability);
            console.log(`энтропия с учетом ошибки ${errorProbability} для бинарного алфавита: ${errorImpact}`);
        });

        return entropy;

    } catch (error) {
        console.error("ошибка чтения бинарного файла:", error.message);
    }
}
// function analyzeBinaryFile(filePath) {
//     try {
//         const buffer = fs.readFileSync(filePath);  

//         let binaryString = buffer.toString('hex'); 
//         binaryString = binaryString.split("").map(char => parseInt(char, 16).toString(2).padStart(4, '0')).join("");

//         const frequencies = calculateFrequencies(binaryString, "01");
//         const totalChars = Object.values(frequencies).reduce((sum, freq) => sum + freq, 0);
//         console.log("частоты символов:", frequencies);
//         const entropy = entropyy(frequencies, totalChars);
//         // console.log("этропия бинарного алфавита:", entropy.toFixed(4));

//     } catch (error) {
//         console.error("ошибка чтения бинарного файла:", error.message);
//     }
// }

function quantityOfInformation(entropy, name) {
    const nameLength = name.length;
    return (entropy * nameLength).toFixed(4);  
}

function convertToAscii(text) {
    return text.split("").map((char) => char.charCodeAt(0)).join("");
}

const polishEntropy = analyzeText(polishFilePath, polishAlphabet, "польский");
const belarusianEntropy = analyzeText(belarusianFilePath, belarusianAlphabet, "белорусский");

const fullName = "SasnowiecMariaIgorewna";  
const fullNameCyrillic = "СаснавецМарыяІгараўна";  

const asciiEntropy = 4.1763; 
const kirEntropy = 4.4958; 

console.log("количество информации SasnowiecMariaIgorewna: ", quantityOfInformation(polishEntropy, fullName));
console.log("количество информации СаснавецМарыяІгараўна: ", quantityOfInformation(belarusianEntropy, fullNameCyrillic));
console.log("количество информации в ASCII: ", quantityOfInformation(asciiEntropy, convertToAscii(fullName)));


function calculateErrorImpact(entropy, errorProbability) {
    const errorAdjustedEntropy = entropy * (1 - errorProbability);
    return errorAdjustedEntropy.toFixed(4);
}

// const errorProbabilities = [0.1, 0.5, 1.0];

// errorProbabilities.forEach((errorProbability) => {
//     const errorImpactPolish = calculateErrorImpact(polishEntropy, errorProbability);
//     console.log(`энтропия с учетом ошибки ${errorProbability} для польского алфавита: ${errorImpactPolish}`);
    
//     const errorImpactBelarusian = calculateErrorImpact(belarusianEntropy, errorProbability);
//     console.log(`энтропия с учетом ошибки ${errorProbability} для белорусского алфавита: ${errorImpactBelarusian}`);
// });

// analyzeBinaryFile(polishFilePath, polishAlphabet, "польский");
// analyzeBinaryFile(belarusianFilePath, belarusianAlphabet, "белорусский");


calculateBinaryEntropyWithErrors(polishFilePath);
calculateBinaryEntropyWithErrors(belarusianFilePath);