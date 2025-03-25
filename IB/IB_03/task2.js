const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const findPrimesInRange = (start, end) => {
    const primes = [];
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

const start = 2;
const end = 397;

const primesInRange = findPrimesInRange(start, end);
const actualPrimeCount = primesInRange.length;
const theoreticalCount = theoreticalPrimeCount(end);

console.log(`Простые числа в диапазоне [${start}, ${end}]: ${primesInRange}`);
console.log(`Количество простых чисел: ${actualPrimeCount}`);
console.log(`n/ln(n): ${Math.round(theoreticalCount)}`);