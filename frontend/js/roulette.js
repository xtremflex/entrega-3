document.addEventListener("DOMContentLoaded", async () => {
  // ======== REFERENCIAS DOM ========
  const wheel = document.getElementById("roulette-wheel");
  const ball = document.getElementById("ball");
  const gameStateDisplay = document.getElementById("game-state");
  const userBalanceDisplay = document.getElementById("user-balance");
  const totalBetDisplay = document.getElementById("total-bet-amount");
  const resultDisplay = document.querySelector("#result-display span");

  const chipSelection = document.querySelector(".chip-selection");
  const betOptions = document.querySelectorAll(".bet-option");
  const btnSpin = document.getElementById("btn-spin");
  const btnClear = document.getElementById("btn-clear");

  const lastNumbersList = document.getElementById("last-numbers-list");
  const lastBetsList = document.getElementById("last-bets-list");

  // ======== ESTADO =========
  let currentBalance = 0;
  let currentChipValue = 1000;
  let currentBets = {};
  let totalBetAmount = 0;
  let isSpinning = false;

  const wheelNumbersOrder = [
    0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20,
    1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6,
    34, 17, 25, 2, 21, 4, 19, 15, 32
  ];

  const numberColors = {
    0: "verde", 1: "rojo", 2: "negro", 3: "rojo", 4: "negro", 5: "rojo",
    6: "negro", 7: "rojo", 8: "negro", 9: "rojo", 10: "negro",
    11: "negro", 12: "rojo", 13: "negro", 14: "rojo", 15: "negro",
    16: "rojo", 17: "negro", 18: "rojo", 19: "rojo", 20: "negro",
    21: "rojo", 22: "negro", 23: "rojo", 24: "negro", 25: "rojo",
    26: "negro", 27: "rojo", 28: "negro", 29: "negro", 30: "rojo",
    31: "negro", 32: "rojo", 33: "negro", 34: "rojo", 35: "negro", 36: "rojo"
  };

  // ======== CARGAR SALDO INICIAL DESDE API ========
try {
  const res = await fetch("/api/user/me", {
    credentials: "include"
  });

  if (res.ok) {
    const data = await res.json();
    if (!data.error) {
      currentBalance = data.user.balance;  // ← FIX
      updateBalance(currentBalance);
    }
  }
} catch (err) {
  console.error("Error cargando saldo inicial:", err);
}
  // ======== CARGAR ESTADO INICIAL ========
  async function loadInitialState() {
    try {
      const res = await fetch("/api/roulette/state", {
        credentials: "include"
      });

      const data = await res.json();
      if (!res.ok) return;

      // Últimos números
      if (Array.isArray(data.lastNumbers)) {
        data.lastNumbers.forEach(n => {
          const color = n.color === "rojo" ? "rojo" :
                        n.color === "negro" ? "negro" :
                        "verde";
          updateLastNumbers(n.winningNumber, color);
        });
      }

      // Últimas apuestas
      if (Array.isArray(data.lastBets)) {
        data.lastBets.forEach(bet => {
          updateLastBets([
            {
              type: bet.betType,
              amount: Math.abs(bet.amount),
              won: bet.type === "win",
              payout: bet.type === "win" ? bet.amount : 0
            }
          ]);
        });
      }

    } catch (err) {
      console.error("Error al cargar estado inicial:", err);
    }
  }

  loadInitialState();

  // ======== SELECCIÓN DE FICHAS ========
  chipSelection.addEventListener("click", (e) => {
    if (!e.target.classList.contains("chip")) return;

    const activeChip = chipSelection.querySelector(".chip.active");
    if (activeChip) activeChip.classList.remove("active");

    e.target.classList.add("active");
    currentChipValue = parseInt(e.target.dataset.value, 10);
  });

  // ======== LIMPIAR APUESTAS ========
  btnClear.addEventListener("click", () => {
    if (isSpinning) return;
    currentBets = {};
    totalBetAmount = 0;
    updateBetDisplays();
    document.querySelectorAll(".placed-chip").forEach(chip => chip.remove());
  });

  // ======== AGREGAR APUESTA ========
  betOptions.forEach((option) => {
    option.addEventListener("click", () => {
      if (isSpinning) return;

      const betType = option.dataset.betType;
      if (!betType) return;

      if (currentBalance < totalBetAmount + currentChipValue) {
        showResultDisplay("Saldo insuficiente", "error");
        return;
      }

      if (!currentBets[betType]) currentBets[betType] = 0;
      currentBets[betType] += currentChipValue;

      totalBetAmount += currentChipValue;
      updateBetDisplays();
      visualizeChip(option, currentBets[betType]);
    });
  });

  // ======== GIRAR RULETA ========
  btnSpin.addEventListener("click", async () => {
    if (isSpinning || totalBetAmount === 0) return;

    isSpinning = true;
    setGameState("Girando...");
    btnSpin.disabled = true;
    btnClear.disabled = true;

    const betsToSend = Object.keys(currentBets).map((type) => ({
      type,
      amount: currentBets[type]
    }));

    try {
      const response = await fetch("/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bets: betsToSend })
      });

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error);

      await spinWheel(result.winningNumber);

      const colorName = numberColors[result.winningNumber];
      const colorClass = colorName === "rojo" ? "rojo" :
                         colorName === "negro" ? "negro" : "verde";

      showResultDisplay(`¡Ganó el ${result.winningNumber} ${colorName}!`, colorClass);

      updateBalance(result.newBalance);
      updateLastNumbers(result.winningNumber, colorClass);

      if (Array.isArray(result.betResults)) updateLastBets(result.betResults);

    } catch (err) {
      console.error("Error al girar:", err);
      showResultDisplay(err.message, "error");
    } finally {
      resetGame();
    }
  });

  // ======== FUNCIONES COMPLEMENTO ========
  function setGameState(state) {
    gameStateDisplay.textContent = state;
  }

  function updateBetDisplays() {
    totalBetDisplay.textContent = formatCurrency(totalBetAmount);
  }

  function updateBalance(newBalance) {
    currentBalance = newBalance;
    userBalanceDisplay.textContent = formatCurrency(newBalance);
  }

  function visualizeChip(betOptionElement, amountOnSpot) {
    const chipVisual = document.createElement("div");
    chipVisual.classList.add("placed-chip");

    if (amountOnSpot >= 10000) chipVisual.classList.add("chip-value-10000");
    else if (amountOnSpot >= 5000) chipVisual.classList.add("chip-value-5000");
    else if (amountOnSpot >= 1000) chipVisual.classList.add("chip-value-1000");
    else if (amountOnSpot >= 500) chipVisual.classList.add("chip-value-500");
    else chipVisual.classList.add("chip-value-100");

    chipVisual.textContent =
      amountOnSpot >= 1000 ? amountOnSpot / 1000 + "K" : amountOnSpot;

    const existingChip = betOptionElement.querySelector(".placed-chip");
    if (existingChip) existingChip.remove();

    betOptionElement.appendChild(chipVisual);
  }

  function spinWheel(winningNumber) {
    return new Promise((resolve) => {
      const index = wheelNumbersOrder.indexOf(winningNumber);
      const slotAngle = 360 / wheelNumbersOrder.length;

      const targetAngle = index * slotAngle;
      const randomWheelAngle = Math.random() * 360;
      const randomBallAngle = (slotAngle * Math.random() - 0.5) / 3;

      const wheelRotation = 360 * 9 + targetAngle + randomWheelAngle;
      const ballRotation =
        360 * -15 + wheelRotation - targetAngle + randomBallAngle;

      wheel.style.transition = "all 4s cubic-bezier(0.2, 0.8, 0.7, 1)";
      wheel.style.transform = `rotate(${wheelRotation}deg)`;

      ball.style.transition = "all 4s cubic-bezier(0.1, 0.5, 0.3, 1)";
      ball.style.transform = `rotate(${ballRotation}deg)`;

      setTimeout(() => {
        wheel.style.transition = "none";
        ball.style.transition = "none";

        wheel.style.transform = `rotate(${wheelRotation % 360}deg)`;
        ball.style.transform = `rotate(${ballRotation % 360}deg)`;

        resolve();
      }, 4100);
    });
  }

  function showResultDisplay(message, type) {
    resultDisplay.textContent = message;
    const box = resultDisplay.parentElement;

    box.className = "";

    if (type === "error") box.classList.add("result-display-error");
    else box.classList.add(`result-display-${type}`);

    box.style.opacity = 1;
    setTimeout(() => (box.style.opacity = 0), 3000);
  }

  function resetGame() {
    isSpinning = false;
    setGameState("Recibiendo apuestas");
    btnSpin.disabled = false;
    btnClear.disabled = false;
    currentBets = {};
    totalBetAmount = 0;
    updateBetDisplays();
    document.querySelectorAll(".placed-chip").forEach((chip) => chip.remove());
  }

  function updateLastNumbers(number, colorClass) {
    const li = document.createElement("li");
    li.classList.add(`number-${colorClass}`);
    li.textContent = number;

    lastNumbersList.prepend(li);
    while (lastNumbersList.children.length > 5)
      lastNumbersList.removeChild(lastNumbersList.lastElementChild);
  }

  function updateLastBets(betResults) {
    if (!Array.isArray(betResults) || betResults.length === 0) return;

    if (
      lastBetsList.children.length === 1 &&
      lastBetsList.children[0].textContent.includes("Sin apuestas recientes")
    ) {
      lastBetsList.innerHTML = "";
    }

    betResults.forEach((bet) => {
      const li = document.createElement("li");

      const won = bet.won;
      const resultClass = won ? "result-win" : "result-lose";
      const resultText = won ? "Ganó" : "Perdió";

      const displayAmount = won ? bet.payout : -bet.amount;

      li.innerHTML = `
        <span>${bet.type} (${formatCurrency(displayAmount)})</span>
        <span class="${resultClass}">${resultText}</span>
      `;

      lastBetsList.prepend(li);
    });

    while (lastBetsList.children.length > 5)
      lastBetsList.removeChild(lastBetsList.lastElementChild);
  }

  function formatCurrency(number) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP"
    }).format(number);
  }
});
