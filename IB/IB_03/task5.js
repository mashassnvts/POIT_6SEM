const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const checkConcatenatedNumberIsPrime = (m, n) => {
    const concatenatedNumber = parseInt(m.toString() + n.toString(), 10);
    
    return isPrime(concatenatedNumber);
};

const m = 354;
const n = 397;

const result = checkConcatenatedNumberIsPrime(m, n);
console.log(`Число, полученное из конкатенации ${m} и ${n}, ${result ? "является" : "не является"} простым.`);
