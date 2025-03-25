const math = require('mathjs'); 

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const countPrimesInRange = (start, end) => {
    let primes = [];
    for (let i = start; i <= end; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
};

const theoreticalPrimeCount = (n) => {
    return n / Math.log(n); // n / ln(n)
};

// console.log(`Теоретическое количество простых чисел по формуле n/ln(n): ${Math.round(theoreticalCount)}`);

const start = 354;
const end = 397;

const primesInRange = countPrimesInRange(start, end);
const actualPrimeCount = primesInRange.length;
const theoreticalCount = theoreticalPrimeCount(end);


console.log(`Простые числа в диапазоне [${start}, ${end}]: ${primesInRange.join(', ')}`);
console.log(`Реальное количество простых чисел в диапазоне [${start}, ${end}]: ${actualPrimeCount}`);
