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
        teslaMode: document.getElementById("tesla-mode"),
        mentePremiadaMode: document.getElementById("mente-premiada-mode"),
        generateBtn: document.getElementById("generate-btn"),
        clearBtn: document.getElementById("clear-btn"),
        exportBtn: document.getElementById("export-btn"),
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
        lotofacil: { range: 25, min: 15, max: 20, sumRange: [160, 240], evenOdd: [4, 11], lineCol: true, maxAttempts: 200, hotNumbers: [1, 3, 5, 10, 15], coldNumbers: [2, 4, 6] },
        megasena: { range: 60, min: 6, max: 15, sumRange: [90, 260], evenOdd: [1, 5], lineCol: false, maxAttempts: 50, hotNumbers: [5, 23, 33], coldNumbers: [1, 2, 4] },
        quina: { range: 80, min: 5, max: 15, sumRange: [70, 310], evenOdd: [1, 5], lineCol: false, maxAttempts: 50, hotNumbers: [4, 15, 30], coldNumbers: [1, 2, 3] },
        lotomania: { range: 100, min: 50, max: 50, sumRange: [1700, 2900], evenOdd: [18, 32], lineCol: false, maxAttempts: 50, hotNumbers: [5, 25, 50], coldNumbers: [1, 2, 3] },
        duplasena: { range: 50, min: 6, max: 15, sumRange: [90, 260], evenOdd: [1, 5], lineCol: false, maxAttempts: 50, hotNumbers: [3, 15, 30], coldNumbers: [1, 2, 4] }
    };

    const colorGroups = {
        group1: [1, 2, 3, 4, 5],
        group2: [6, 7, 8, 9, 0]
    };

    function loadSavedGames() {
        const saved = localStorage.getItem(`mente-premiada-${gameType}`);
        if (saved) {
            elements.resultDisplay.innerHTML = saved;
        }
    }

    function saveGames() {
        localStorage.setItem(`mente-premiada-${gameType}`, elements.resultDisplay.innerHTML);
    }

    function updateNumberInputRange() {
        const { min, max } = games[gameType];
        elements.numberInput.min = min;
        elements.numberInput.max = max;
        elements.numberInput.value = min;
    }

    function updateGameIndicator() {
        const name = {
            lotofacil: "Lotofácil",
            megasena: "Mega-Sena",
            quina: "Quina",
            lotomania: "Lotomania",
            duplasena: "Dupla Sena"
        }[gameType];
        elements.gameTypeTitle.textContent = name;
    }

    function generateNumberGrid() {
        const total = games[gameType].range;
        elements.numberGrid.innerHTML = "";
        for (let i = 1; i <= total; i++) {
            const num = i.toString().padStart(2, "0");
            const div = document.createElement("div");
            div.classList.add("number-box");
            div.textContent = num;
            div.dataset.number = num;
            if (elements.usePattern.checked) {
                const termination = i % 10;
                if (colorGroups.group1.includes(termination)) {
                    div.style.backgroundColor = "#1E90FF";
                } else if (colorGroups.group2.includes(termination)) {
                    div.style.backgroundColor = "#FFD700";
                }
            }
            elements.numberGrid.appendChild(div);
        }
    }

    function countEvenOdd(numbers) {
        const pares = numbers.filter(n => n % 2 === 0).length;
        return { pares, impares: numbers.length - pares };
    }

    function getSum(numbers) {
        return numbers.reduce((a, b) => a + b, 0);
    }

    function isTeslaValid(numbers) {
        return numbers.filter(num =>
            num % 3 === 0 || num.toString().includes("3") ||
            num.toString().includes("6") || num.toString().includes("9")
        ).length >= 1;
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

    function isStatisticallyValid(numbers) {
        const { pares, impares } = countEvenOdd(numbers);
        const { evenOdd, sumRange } = games[gameType];
        const sum = getSum(numbers);
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
        let attempts = 0;
        const maxInnerAttempts = 20;

        while (attempts++ < maxInnerAttempts) {
            selected = [];
            for (let i = 0; i < 5; i++) {
                const rowNums = matriz[i];
                const count = Math.floor(Math.random() * 2) + 3;
                const shuffledRow = rowNums.sort(() => Math.random() - 0.5);
                const rowSelection = shuffledRow.slice(0, count);
                selected.push(...rowSelection);
            }

            selected = [...new Set(selected)];

            while (selected.length < total) {
                const remaining = Array.from({ length: 25 }, (_, i) => i + 1).filter(n => !selected.includes(n));
                const sum = getSum(selected);
                const { pares } = countEvenOdd(selected);
                const needsEven = pares < 5 || (pares < total / 2 && Math.random() > 0.5);
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
            }

            if (isStatisticallyValid(selected)) {
                return selected.sort((a, b) => a - b);
            }
        }

        return generateRandom(total, 25);
    }

    function generateRandom(total, range) {
        const selected = new Set();
        while (selected.size < total) {
            const n = Math.floor(Math.random() * range) + 1;
            selected.add(n);
        }
        return Array.from(selected).sort((a, b) => a - b);
    }

    function applyMentePremiadaFilter(numbers, total, range) {
        const { hotNumbers, coldNumbers } = games[gameType];
        let result = [...numbers];

        // Garantir pelo menos 1 número quente
        const hasHot = result.some(n => hotNumbers.includes(n));
        if (!hasHot) {
            const hotNum = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
            const idx = Math.floor(Math.random() * result.length);
            result[idx] = hotNum;
            result = [...new Set(result)].sort((a, b) => a - b);
            while (result.length < total) {
                const n = Math.floor(Math.random() * range) + 1;
                if (!result.includes(n)) result.push(n);
            }
            result.sort((a, b) => a - b);
        }

        // Evitar números frios, se possível
        result = result.map(n => {
            if (coldNumbers.includes(n) && Math.random() > 0.3) {
                let newNum;
                do {
                    newNum = Math.floor(Math.random() * range) + 1;
                } while (result.includes(newNum) || coldNumbers.includes(newNum));
                return newNum;
            }
            return n;
        }).sort((a, b) => a - b);

        return result;
    }

    function applyTeslaFilter(numbers, total, range) {
        let result = [...numbers];
        if (!isTeslaValid(result)) {
            const teslaNum = Array.from({ length: range }, (_, i) => i + 1)
                .filter(n => (n % 3 === 0 || n.toString().includes("3") || n.toString().includes("6") || n.toString().includes("9")))[0];
            const idx = Math.floor(Math.random() * result.length);
            result[idx] = teslaNum;
            result = [...new Set(result)].sort((a, b) => a - b);
            while (result.length < total) {
                const n = Math.floor(Math.random() * range) + 1;
                if (!result.includes(n)) result.push(n);
            }
            result.sort((a, b) => a - b);
        }
        return result;
    }

    function generateGameWithFilters(total, range) {
        let numbers = generateRandom(total, range);
        let attempts = 0;
        const maxAttempts = games[gameType].maxAttempts;

        while (attempts++ < maxAttempts) {
            // Passo 1: Geração Base (aleatória ou balanceada para Lotofácil)
            if (elements.useStats.checked && gameType === "lotofacil") {
                numbers = generateBalancedLotofacil(total);
            } else {
                numbers = generateRandom(total, range);
            }

            // Passo 2: Aplicar Filtro Mente Premiada (se ativo)
            if (elements.mentePremiadaMode.checked) {
                numbers = applyMentePremiadaFilter(numbers, total, range);
            }

            // Passo 3: Aplicar Energia 3•6•9 (se ativo)
            if (elements.teslaMode.checked) {
                numbers = applyTeslaFilter(numbers, total, range);
            }

            // Passo 4: Validar estatísticas (se Modo Estatístico estiver ativo)
            const isStatsValid = !elements.useStats.checked || isStatisticallyValid(numbers);
            const isTeslaValidCheck = !elements.teslaMode.checked || isTeslaValid(numbers);

            if (isStatsValid && isTeslaValidCheck) {
                return numbers;
            }
        }

        return numbers; // Retorna o último conjunto gerado se não atender a todos os critérios
    }

    async function generateGame() {
        console.log("Botão Gerar Jogo clicado");
        const total = parseInt(elements.numberInput.value);
        const { range, min, max, maxAttempts } = games[gameType];
        console.log(`Total: ${total}, Range: ${range}, GameType: ${gameType}`);

        if (isNaN(total) || total < min || total > max) {
            alert(`Por favor, insira um número entre ${min} e ${max}.`);
            console.log(`Entrada inválida: total=${total}, min=${min}, max=${max}`);
            return;
        }

        elements.loading.classList.remove("hidden");
        elements.generateBtn.disabled = true;

        let result = [];
        let result2 = [];

        // Gerar o primeiro sorteio
        result = generateGameWithFilters(total, range);

        // Gerar o segundo sorteio para Dupla Sena
        if (gameType === "duplasena") {
            result2 = generateGameWithFilters(total, range).filter(n => !result.includes(n));
            while (result2.length < total) {
                const n = generateRandom(1, range)[0];
                if (!result.includes(n) && !result2.includes(n)) result2.push(n);
            }
            result2.sort((a, b) => a - b);
        }

        elements.loading.classList.add("hidden");
        elements.generateBtn.disabled = false;

        const { pares, impares } = countEvenOdd(result);
        const soma = getSum(result);
        const hotCount = result.filter(n => games[gameType].hotNumbers.includes(n)).length;
        const coldCount = result.filter(n => games[gameType].coldNumbers.includes(n)).length;
        const teslaCount = result.filter(n => n % 3 === 0 || n.toString().includes("3") || n.toString().includes("6") || n.toString().includes("9")).length;

        const box = document.createElement("div");
        box.classList.add("game-result");
        box.innerHTML = `
            <p><strong>${gameType.toUpperCase()}:</strong> ${result.map(n => n.toString().padStart(2, '0')).join(", ")}</p>
            <p>🔢 Pares: ${pares} | Ímpares: ${impares}</p>
            <p>➕ Soma: ${soma}</p>
            ${games[gameType].lineCol && elements.useStats.checked ? "<p>📊 Linhas/Colunas balanceadas: ✅</p>" : ""}
            <p>🔥 Números Quentes: ${hotCount} | ❄️ Números Frios: ${coldCount}</p>
            <p>⚡ Números 3•6•9: ${teslaCount}</p>
        `;

        if (gameType === "duplasena") {
            const { pares: pares2, impares: impares2 } = countEvenOdd(result2);
            const soma2 = getSum(result2);
            const hotCount2 = result2.filter(n => games[gameType].hotNumbers.includes(n)).length;
            const coldCount2 = result2.filter(n => games[gameType].coldNumbers.includes(n)).length;
            const teslaCount2 = result2.filter(n => n % 3 === 0 || n.toString().includes("3") || n.toString().includes("6") || n.toString().includes("9")).length;
            box.innerHTML += `
                <p><strong>2º Sorteio:</strong> ${result2.map(n => n.toString().padStart(2, '0')).join(", ")}</p>
                <p>🔢 Pares: ${pares2} | Ímpares: ${impares2}</p>
                <p>➕ Soma: ${soma2}</p>
                <p>🔥 Números Quentes: ${hotCount2} | ❄️ Números Frios: ${coldCount2}</p>
                <p>⚡ Números 3•6•9: ${teslaCount2}</p>
            `;
        }

        elements.resultDisplay.appendChild(box);

        document.querySelectorAll(".number-box").forEach(b => {
            b.classList.remove("generated");
            b.classList.remove("tesla");
        });
        const allNumbers = [...result, ...(gameType === "duplasena" ? result2 : [])];
        allNumbers.forEach(num => {
            const el = document.querySelector(`.number-box[data-number="${num.toString().padStart(2, "0")}"]`);
            if (el) {
                el.classList.add("generated");
                if (num % 3 === 0 || num.toString().includes("3") || num.toString().includes("6") || num.toString().includes("9")) {
                    el.classList.add("tesla");
                }
            }
        });

        saveGames();
        console.log(`Jogo gerado: ${result}${gameType === "duplasena" ? `, 2º sorteio: ${result2}` : ""}`);
    }

    async function exportToPDF() {
        console.log("Botão Exportar PDF clicado");
        const element = document.getElementById("result");
        if (!element || element.innerHTML.trim() === "<h3>Jogos Gerados:</h3>") {
            alert("Por favor, gere pelo menos um jogo antes de exportar.");
            console.log("Nenhum jogo gerado para exportação.");
            return;
        }

        elements.loading.classList.remove("hidden");
        elements.exportBtn.disabled = true;

        const opt = {
            margin: 1,
            filename: `Mente_Premiada_${gameType}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        try {
            await html2pdf().from(element).set(opt).save();
            console.log("PDF exportado com sucesso.");
        } catch (error) {
            console.error("Erro ao exportar PDF:", error);
            alert("Ocorreu um erro ao exportar o PDF. Verifique o console para detalhes.");
        } finally {
            elements.loading.classList.add("hidden");
            elements.exportBtn.disabled = false;
        }
    }

    Object.keys(elements.buttons).forEach(type => {
        elements.buttons[type].addEventListener("click", () => {
            gameType = type;
            updateGameIndicator();
            updateNumberInputRange();
            generateNumberGrid();
            loadSavedGames();
        });
    });

    elements.generateBtn.addEventListener("click", generateGame);
    elements.clearBtn.addEventListener("click", () => {
        elements.resultDisplay.innerHTML = "";
        localStorage.removeItem(`mente-premiada-${gameType}`);
        document.querySelectorAll(".number-box").forEach(b => {
            b.classList.remove("generated");
            b.classList.remove("tesla");
        });
    });
    elements.exportBtn.addEventListener("click", exportToPDF);
    elements.usePattern.addEventListener("change", generateNumberGrid);

    updateGameIndicator();
    updateNumberInputRange();
    generateNumberGrid();
    loadSavedGames();
});
