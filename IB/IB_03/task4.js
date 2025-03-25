const primeFactors = (num) => {
    let factors = [];
    let divisor = 2;

    while (num >= divisor) {
        while (num % divisor === 0) {
            factors.push(divisor);
            num /= divisor;
        }
        divisor++;
    }

    return factors;
};

const canonicalForm = (num) => {
    const factors = primeFactors(num);
    let form = '';

    const factorCounts = {};
    factors.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });

    for (const factor in factorCounts) {
        if (form !== '') {
            form += ' * ';
        }
        form += `${factor}`;
        if (factorCounts[factor] > 1) {
            form += `^${factorCounts[factor]}`;
        }
    }

    return form;
};

const m = 354;
const n = 397;

console.log(`Число ${m} в канонической форме: ${canonicalForm(m)}`);
console.log(`Число ${n} в канонической форме: ${canonicalForm(n)}`);
