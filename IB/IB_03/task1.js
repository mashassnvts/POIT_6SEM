document.addEventListener("DOMContentLoaded", () => {
    const operationButtons = document.querySelectorAll(".operations button");
    const inputs = {
        gcd2: document.getElementById("input-gcd2"),
        gcd3: document.getElementById("input-gcd3"),
        primes: document.getElementById("input-primes"),
    };

    let selectedOperation = "";

    operationButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedOperation = button.dataset.operation;

            for (const key in inputs) {
                inputs[key].style.display = key === selectedOperation ? "block" : "none";
            }
        });
    });

    document.getElementById("calculate").addEventListener("click", () => {
        const resultDiv = document.getElementById("result");
        let result = "";

        if (selectedOperation === "gcd2") {
            const a = parseInt(document.getElementById("gcd2-a").value, 10);
            const b = parseInt(document.getElementById("gcd2-b").value, 10);
            if (!isNaN(a) && !isNaN(b)) {
                result = `НОД(${a}, ${b}) = ${gcdTwoNumbers(a, b)}`;
            } else {
                result = "Ошибка: введите корректные числа.";
            }
        } else if (selectedOperation === "gcd3") {
            const a = parseInt(document.getElementById("gcd3-a").value, 10);
            const b = parseInt(document.getElementById("gcd3-b").value, 10);
            const c = parseInt(document.getElementById("gcd3-c").value, 10);
            if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
                result = `НОД(${a}, ${b}, ${c}) = ${gcdThreeNumbers(a, b, c)}`;
            } else {
                result = "Ошибка: введите корректные числа.";
            }
        } else if (selectedOperation === "primes") {
            const start = parseInt(document.getElementById("primes-start").value, 10);
            const end = parseInt(document.getElementById("primes-end").value, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
                const primes = findPrimesInRange(start, end);
                result = `Простые числа в диапазоне [${start}, ${end}]: ${primes.join(", ")}`;
            } else {
                result = "Ошибка: введите корректный диапазон.";
            }
        }

        resultDiv.textContent = result;
    });

    const gcdTwoNumbers = (a, b) => {
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a;
    };

    const gcdThreeNumbers = (a, b, c) => gcdTwoNumbers(gcdTwoNumbers(a, b), c);

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
            if (isPrime(i)) primes.push(i);
        }
        return primes;
    };
});
