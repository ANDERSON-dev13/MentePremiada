document.addEventListener("DOMContentLoaded", () => {
    const elements = {
        buttons: {
            lotofacil: document.getElementById("lotofacil-btn"),
            megasena: document.getElementById("megasena-btn"),
            quina: document.getElementById("quina-btn"),
            lotomania: document.getElementById("lotomania-btn"),
            duplasena: document.getElementById("duplasena-btn")
        },
        gameTypeTitle: document.getElementById("game-type-title"),
        numberGrid: document.getElementById("grid-numbers"),
        resultDisplay: document.getElementById("result"),
        numberInput: document.getElementById("number-to-generate"),
        usePattern: document.getElementById("distribution-toggle"),
        useStats: document.getElementById("statistical-mode"),
        generateBtn: document.getElementById("generate-btn"),
        clearBtn: document.getElementById("clear-btn"),
        loading: document.getElementById("loading")
    };

    for (const [key, value] of Object.entries(elements)) {
        if (!value && key !== "buttons") {
            console.error(`Element ${key} not found in DOM`);
            alert("Erro: Um ou mais elementos da página não foram encontrados. Verifique o HTML.");
            return;
        }
        if (key === "buttons") {
            for (const [btnKey, btnValue] of Object.entries(value)) {
                if (!btnValue) {
                    console.error(`Button ${btnKey} not found in DOM`);
                    alert("Erro: Um ou mais botões de jogo não foram encontrados. Verifique o HTML.");
                    return;
                }
            }
        }
    }

    let gameType = "lotofacil";

    const games = {
        lotofacil: { range: 25, min: 15, max: 20, sumRange: [160, 240], evenOdd: [4, 11], lineCol: true, maxAttempts: 200 },
        megasena: { range: 60, min: 6, max: 15, sumRange: [90, 260], evenOdd: [1, 5], lineCol: false, maxAttempts: 50 },
        quina: { range: 80, min: 5, max: 15, sumRange: [70, 310], evenOdd: [1, 5], lineCol: false, maxAttempts: 50 },
        lotomania: { range: 100, min: 50, max: 50, sumRange: [1700, 2900], evenOdd: [18, 32], lineCol: false, maxAttempts: 50 },
        duplasena: { range: 50, min: 6, max: 15, sumRange: [90, 260], evenOdd: [1, 5], lineCol: false, maxAttempts: 50 }
    };

    const colorGroups = {
        group1: [1, 2, 3, 4, 5],
        group2: [6, 7, 8, 9, 0]
    };

    function loadSavedGames() {
        const saved = localStorage.getItem(`sua-sorte-${gameType}`);
        if (saved) {
            elements.resultDisplay.innerHTML = saved;
        }
    }

    function saveGames() {
        localStorage.setItem(`sua-sorte-${gameType}`, elements.resultDisplay.innerHTML);
    }

    function generateNumberGrid() {
        elements.numberGrid.innerHTML = "";
        const range = games[gameType].range;
        for (let i = 1; i <= range; i++) {
            const numElement = document.createElement("div");
            numElement.classList.add("number-box");
            numElement.dataset.number = i;
            numElement.textContent = i.toString().padStart(2, "0");
            if (elements.usePattern.checked) {
                const termination = i % 10;
                if (colorGroups.group1.includes(termination)) {
                    numElement.style.backgroundColor = "#1E90FF";
                } else if (colorGroups.group2.includes(termination)) {
                    numElement.style.backgroundColor = "#FFD700";
                }
            }
            elements.numberGrid.appendChild(numElement);
        }
    }

    function highlightGeneratedNumbers(numbers) {
        const numberBoxes = document.querySelectorAll(".number-box");
        numberBoxes.forEach(box => box.classList.remove("generated"));
        numbers.forEach(num => {
            const box = document.querySelector(`.number-box[data-number="${num}"]`);
            if (box) box.classList.add("generated");
        });
    }

    function updateNumberInputRange() {
        const game = games[gameType];
        elements.numberInput.min = game.min;
        elements.numberInput.max = game.max;
        elements.numberInput.value = game.min;
    }

    function updateGameIndicator() {
        const title = {
            lotofacil: "Lotofácil",
            megasena: "Mega-Sena",
            quina: "Quina",
            lotomania: "Lotomania",
            duplasena: "Dupla Sena"
        }[gameType];
        elements.gameTypeTitle.textContent = title;
    }

    function countEvenOdd(numbers) {
        const pares = numbers.filter(num => num % 2 === 0).length;
        const impares = numbers.length - pares;
        return { pares, impares };
    }

    function isSumInRange(numbers, [min, max]) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum >= min && sum <= max;
    }

    function isLineColumnBalanced(numbers) {
        if (!games[gameType].lineCol) return true;
        const matriz = [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25]
        ];
        let linhas = Array(5).fill(0);
        let colunas = Array(5).fill(0);

        numbers.forEach(num => {
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (matriz[i][j] === num) {
                        linhas[i]++;
                        colunas[j]++;
                    }
                }
            }
        });

        return linhas.every(q => q >= 3 && q <= 4) && colunas.every(q => q >= 3 && q <= 4);
    }

    function isValidGame(numbers) {
        const { pares, impares } = countEvenOdd(numbers);
        const { evenOdd, sumRange } = games[gameType];
        const sum = numbers.reduce((a, b) => a + b, 0);
        const lineColBalanced = isLineColumnBalanced(numbers);
        const valid = (
            pares >= evenOdd[0] &&
            pares <= evenOdd[1] &&
            impares >= evenOdd[0] &&
            impares <= evenOdd[1] &&
            sum >= sumRange[0] &&
            sum <= sumRange[1] &&
            lineColBalanced
        );
        if (!valid) {
            console.log(`Tentativa falhou (${gameType}): Pares=${pares}, Ímpares=${impares}, Soma=${sum}, Linhas/Colunas=${lineColBalanced}`);
        }
        return valid;
    }

    function generateBalancedLotofacil(total) {
        const matriz = [
            [1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25]
        ];
        let selected = [];
        let evenCount = 0;
        let oddCount = 0;
        let attempts = 0;
        const maxInnerAttempts = 20;

        while (attempts++ < maxInnerAttempts) {
            selected = [];
            evenCount = 0;
            oddCount = 0;

            for (let i = 0; i < 5; i++) {
                const rowNums = matriz[i];
                const count = Math.floor(Math.random() * 2) + 3;
                const shuffledRow = rowNums.sort(() => Math.random() - 0.5);
                const rowSelection = shuffledRow.slice(0, count);
                selected.push(...rowSelection);
                rowSelection.forEach(num => {
                    if (num % 2 === 0) evenCount++;
                    else oddCount++;
                });
            }

            selected = [...new Set(selected)];

            while (selected.length < total) {
                const remaining = Array.from({ length: 25 }, (_, i) => i + 1).filter(n => !selected.includes(n));
                const sum = selected.reduce((a, b) => a + b, 0);
                const needsEven = evenCount < 5 || (evenCount < total / 2 && Math.random() > 0.5);
                let candidates = needsEven
                    ? remaining.filter(n => n % 2 === 0)
                    : remaining.filter(n => n % 2 !== 0);

                if (sum > 220) {
                    candidates = candidates.filter(n => n <= 15);
                } else if (sum < 180) {
                    candidates = candidates.filter(n => n >= 10);
                }

                if (candidates.length === 0) candidates = remaining;
                const n = candidates[Math.floor(Math.random() * candidates.length)];
                selected.push(n);
                if (n % 2 === 0) evenCount++;
                else oddCount++;
            }

            if (isValidGame(selected)) {
                return selected.sort((a, b) => a - b);
            }
        }

        return generateRandomGame(total, 25);
    }

    function generateRandomGame(total, range) {
        const selected = [];
        const allNumbers = Array.from({ length: range }, (_, i) => i + 1);
        while (selected.length < total) {
            const n = allNumbers[Math.floor(Math.random() * allNumbers.length)];
            if (!selected.includes(n)) selected.push(n);
        }
        return selected.sort((a, b) => a - b);
    }

    async function generateGame() {
        const total = parseInt(elements.numberInput.value);
        const { range, min, max, maxAttempts } = games[gameType];

        console.log(`Gerando jogo para ${gameType}, total: ${total}, range: ${range}, min: ${min}, max: ${max}`);

        if (total < min || total > max || isNaN(total)) {
            alert(`Por favor, insira um número entre ${min} e ${max}.`);
            console.log(`Entrada inválida: total=${total}, min=${min}, max=${max}`);
            return;
        }

        elements.loading.classList.remove("hidden");
        elements.generateBtn.disabled = true;

        let selected1 = [];
        let selected2 = [];
        let attempts = 0;
        let usedFallback = false;

        while (attempts++ < maxAttempts) {
            if ((gameType === "lotofacil" || gameType === "duplasena") && elements.useStats.checked && !usedFallback) {
                if (gameType === "lotofacil") {
                    selected1 = generateBalancedLotofacil(total);
                } else {
                    selected1 = generateRandomGame(total, range);
                    selected2 = generateRandomGame(total, range).filter(n => !selected1.includes(n));
                    while (selected2.length < total) {
                        const n = generateRandomGame(1, range)[0];
                        if (!selected1.includes(n) && !selected2.includes(n)) selected2.push(n);
                    }
                    selected2.sort((a, b) => a - b);
                }
            } else {
                selected1 = generateRandomGame(total, range);
                if (gameType === "duplasena") {
                    selected2 = generateRandomGame(total, range).filter(n => !selected1.includes(n));
                    while (selected2.length < total) {
                        const n = generateRandomGame(1, range)[0];
                        if (!selected1.includes(n) && !selected2.includes(n)) selected2.push(n);
                    }
                    selected2.sort((a, b) => a - b);
                }
            }

            const isValid = !elements.useStats.checked || (isValidGame(selected1) && (gameType !== "duplasena" || isValidGame(selected2)));
            if (isValid) {
                console.log(`Jogo gerado com sucesso na tentativa ${attempts}: ${selected1}${gameType === "duplasena" ? `, 2º sorteio: ${selected2}` : ""}`);
                break;
            }

            if ((gameType === "lotofacil" || gameType === "duplasena") && attempts > maxAttempts / 2 && !usedFallback) {
                usedFallback = true;
                attempts = 0;
                console.log(`Usando fallback para ${gameType}: ignorando balanceamento de linhas/colunas.`);
            }
        }

        elements.loading.classList.add("hidden");
        elements.generateBtn.disabled = false;

        if (attempts >= maxAttempts) {
            const div = document.createElement("div");
            div.classList.add("game-result");
            div.innerHTML = `<p><strong>Erro:</strong> Não foi possível gerar um jogo válido após ${maxAttempts} tentativas. Tente desativar o Modo Estatístico ou gerar novamente.</p>`;
            elements.resultDisplay.appendChild(div);
            saveGames();
            console.log(`Falha ao gerar jogo após ${maxAttempts} tentativas.`);
            return;
        }

        const { pares: pares1, impares: impares1 } = countEvenOdd(selected1);
        const sum1 = selected1.reduce((a, b) => a + b, 0);
        const div = document.createElement("div");
        div.classList.add("game-result");
        div.innerHTML = `
            <p><strong>${gameType.toUpperCase()}:</strong> ${selected1.map(n => n.toString().padStart(2, '0')).join(", ")}</p>
            <p>🔢 Pares: ${pares1} | Ímpares: ${impares1}</p>
            <p>➕ Soma: ${sum1}</p>
            ${games[gameType].lineCol && !usedFallback ? "<p>📊 Linhas/Colunas balanceadas: ✅</p>" : ""}
        `;
        if (gameType === "duplasena") {
            const { pares: pares2, impares: impares2 } = countEvenOdd(selected2);
            const sum2 = selected2.reduce((a, b) => a + b, 0);
            div.innerHTML += `
                <p><strong>2º Sorteio:</strong> ${selected2.map(n => n.toString().padStart(2, '0')).join(", ")}</p>
                <p>🔢 Pares: ${pares2} | Ímpares: ${impares2}</p>
                <p>➕ Soma: ${sum2}</p>
            `;
        }
        elements.resultDisplay.appendChild(div);
        saveGames();
        highlightGeneratedNumbers([...selected1, ...(gameType === "duplasena" ? selected2 : [])]);
    }

    Object.keys(elements.buttons).forEach(type => {
        elements.buttons[type].addEventListener("click", () => {
            gameType = type;
            updateNumberInputRange();
            updateGameIndicator();
            generateNumberGrid();
            loadSavedGames();
        });
    });

    elements.generateBtn.addEventListener("click", () => {
        console.log("Botão Gerar Jogo clicado");
        generateGame();
    });

    elements.clearBtn.addEventListener("click", () => {
        elements.resultDisplay.innerHTML = "";
        localStorage.removeItem(`sua-sorte-${gameType}`);
        const numberBoxes = document.querySelectorAll(".number-box");
        numberBoxes.forEach(box => box.classList.remove("generated"));
    });

    elements.usePattern.addEventListener("change", generateNumberGrid);

    updateNumberInputRange();
    updateGameIndicator();
    generateNumberGrid();
    loadSavedGames();
});