document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    buttons: {
      lotofacil: document.getElementById("lotofacil-btn"),
      megasena: document.getElementById("megasena-btn"),
      quina: document.getElementById("quina-btn"),
      lotomania: document.getElementById("lotomania-btn"),
      duplasena: document.getElementById("duplasena-btn"),
      resultado: document.getElementById("ver-resultado-btn"),
    },
    gameTypeTitle: document.getElementById("game-type-title"),
    numberGrid: document.getElementById("grid-numbers"),
    resultDisplay: document.getElementById("result"),
    officialResultDisplay: document.getElementById("official-result"),
    comparisonDisplay: document.getElementById("comparison-result"),
    numberInput: document.getElementById("number-to-generate"),
    usePattern: document.getElementById("distribution-toggle"),
    useStats: document.getElementById("statistical-mode"),
    teslaMode: document.getElementById("tesla-mode"),
    menteMode: document.getElementById("mente-premiada-mode"),
    generateButton: document.getElementById("generate-btn"),
    clearButton: document.getElementById("clear-btn"),
    exportButton: document.getElementById("export-btn"),
    loading: document.getElementById("loading")
  };

  let currentGame = "Lotofácil";
  let jogosGerados = [];

  function atualizarTitulo(tipo) {
    currentGame = tipo;
    elements.gameTypeTitle.textContent = tipo;
  }

  // JOGOS
  elements.buttons.lotofacil.addEventListener("click", () => atualizarTitulo("Lotofácil"));
  elements.buttons.megasena.addEventListener("click", () => atualizarTitulo("Mega-Sena"));
  elements.buttons.quina.addEventListener("click", () => atualizarTitulo("Quina"));
  elements.buttons.lotomania.addEventListener("click", () => atualizarTitulo("Lotomania"));
  elements.buttons.duplasena.addEventListener("click", () => atualizarTitulo("Dupla Sena"));

  // GERAÇÃO DE NÚMEROS
  elements.generateButton.addEventListener("click", () => {
    const quantidade = parseInt(elements.numberInput.value) || 15;
    const jogo = gerarNumeros(quantidade);
    jogosGerados.push(jogo);
    exibirJogo(jogo);
  });

  elements.clearButton.addEventListener("click", () => {
    elements.resultDisplay.innerHTML = "";
    jogosGerados = [];
  });

  elements.exportButton.addEventListener("click", () => {
    const element = document.getElementById("result");
    html2pdf().from(element).save(`jogos_${currentGame.toLowerCase()}.pdf`);
  });

  function gerarNumeros(qtd) {
    const numeros = new Set();
    while (numeros.size < qtd) {
      let max = 25;
      if (currentGame === "Mega-Sena") max = 60;
      else if (currentGame === "Quina") max = 80;
      else if (currentGame === "Lotomania") max = 100;
      else if (currentGame === "Dupla Sena") max = 50;

      numeros.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(numeros).sort((a, b) => a - b);
  }

  function exibirJogo(numeros) {
    const div = document.createElement("div");
    div.classList.add("jogo");
    div.textContent = numeros.join(", ");
    elements.resultDisplay.appendChild(div);
  }

  // BRINN API – RESULTADO OFICIAL
  elements.buttons.resultado.addEventListener("click", async () => {
    const nomeApi = currentGame.toLowerCase().replace(" ", "-");
    const endpoint = `https://brainn-api-loterias.vercel.app/api/v1/${nomeApi}/latest`;

    elements.officialResultDisplay.innerHTML = "Buscando resultado...";
    elements.comparisonDisplay.innerHTML = "";

    try {
      const res = await fetch(endpoint);
      const data = await res.json();

      const dezenas = data.dezenas || data.numeros || [];
      const texto = `Concurso ${data.numeroDoConcurso} (${data.dataApuracao}): ${dezenas.join(", ")}`;
      elements.officialResultDisplay.innerHTML = texto;

      if (jogosGerados.length > 0) {
        jogosGerados.forEach((jogo, i) => {
          const acertos = jogo.filter(num => dezenas.includes(num.toString()));
          const comp = document.createElement("div");
          comp.textContent = `Jogo ${i + 1}: ${acertos.length} acertos (${acertos.join(", ")})`;
          elements.comparisonDisplay.appendChild(comp);
        });
      }
    } catch (error) {
      console.error(error);
      elements.officialResultDisplay.innerHTML = "Erro ao buscar resultado.";
    }
  });
});
