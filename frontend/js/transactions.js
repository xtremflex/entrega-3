document.addEventListener("DOMContentLoaded", () => {
  const balanceEl = document.getElementById("balance");
  const errorMsg = document.getElementById("error-msg");
  const tbody = document.getElementById("transactionsTable");

  const formDeposito = document.getElementById("form-deposito");
  const formRetiro = document.getElementById("form-retiro");

 
  function formatCLP(value) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value);
  }

  async function loadData() {
    try {
      
      const uRes = await fetch("/api/user/me", {
        credentials: "include"   
      });

      const uData = await uRes.json();

      if (!uRes.ok || uData.error) {
        window.location.href = "/frontend/pages/login.html";
        return;
      }

      balanceEl.textContent = formatCLP(uData.user.balance);

    
      const tRes = await fetch("/api/user/transactions", {
        credentials: "include"
      });

      const tData = await tRes.json();
      const transactions = tData.transactions;

      tbody.innerHTML = "";

      if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No hay transacciones registradas.</td></tr>`;
        return;
      }

      transactions.forEach((t) => {
        const tr = document.createElement("tr");

        const fecha = new Date(t.timestamp).toLocaleString("es-CL");

        const tipo =
          t.type === "bet"
            ? "Apuesta"
            : t.type === "win"
            ? "Apuesta Ganada"
            : t.type === "withdraw"
            ? "Retiro"
            : "Depósito";

        const montoClass =
          t.type === "deposit" || t.type === "win"
            ? "monto-positivo"
            : "monto-negativo";

        tr.innerHTML = `
          <td>${fecha}</td>
          <td>${tipo}</td>
          <td>${t.betType || "—"}</td>
          <td class="${montoClass}">${formatCLP(t.amount)}</td>
        `;

        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error("Error cargando transacciones:", err);
      tbody.innerHTML = `<tr><td colspan="4">Error al cargar datos.</td></tr>`;
    }
  }
  // Manejar depósito
  
  formDeposito.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const monto = parseInt(document.getElementById("monto-deposito").value, 10);

    if (!monto || monto <= 0) {
      errorMsg.textContent = "Monto de depósito inválido.";
      return;
    }

    try {
      const res = await fetch("/api/transactions/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: monto }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error || "Error al depositar.";
        return;
      }

      balanceEl.textContent = formatCLP(data.newBalance);
      document.getElementById("monto-deposito").value = "";
      await loadData();

    } catch (err) {
      console.error("Error depósito:", err);
      errorMsg.textContent = "Error al procesar el depósito.";
    }
  });
  
  formRetiro.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const monto = parseInt(document.getElementById("monto-retiro").value, 10);

    if (!monto || monto <= 0) {
      errorMsg.textContent = "Monto de retiro inválido.";
      return;
    }

    try {
      const res = await fetch("/api/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: monto }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.error || "Error al retirar.";
        return;
      }

      balanceEl.textContent = formatCLP(data.newBalance);
      document.getElementById("monto-retiro").value = "";
      await loadData();

    } catch (err) {
      console.error("Error retiro:", err);
      errorMsg.textContent = "Error al procesar el retiro.";
    }
  });

  // Carga inicial
  loadData();
});
