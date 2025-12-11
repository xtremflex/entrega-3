document.addEventListener("DOMContentLoaded", async () => {

  const userSpan = document.getElementById("user");
  const fullnameSpan = document.getElementById("fullname");
  const rutSpan = document.getElementById("rut");
  const mailSpan = document.getElementById("mail");
  const balanceSpan = document.getElementById("balance");
  const tableBody = document.getElementById("transactionsTable");

  // ================================
  // 1. Cargar datos del usuario
  // ================================
  try {
    const res = await fetch("/api/user/me", {
      credentials: "include"
    });

    const u = await res.json();

    if (!res.ok || u.error) {
      console.error("Error al cargar usuario:", u.error);
      return;
    }

    userSpan.textContent = u.user.user;
    fullnameSpan.textContent = `${u.user.name} ${u.user.surname}`;
    rutSpan.textContent = u.user.rut;
    mailSpan.textContent = u.user.mail;
    balanceSpan.textContent = u.user.balance;

  } catch (err) {
    console.error("Error cargando perfil:", err);
  }

  // =====================================
  // 2. Cargar últimas transacciones
  // =====================================
  try {
    const res = await fetch("/api/user/transactions", {
      credentials: "include"
    });

    const data = await res.json();
    const transactions = data.transactions;

    if (!transactions || transactions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4">No hay transacciones aún</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    transactions.forEach(t => {
      const row = document.createElement("tr");

      const fecha = new Date(t.timestamp).toLocaleString("es-CL");
      const tipo =
        t.type === "bet" ? "Apuesta" :
        t.type === "win" ? "Ganancia" :
        t.type === "deposit" ? "Depósito" :
        t.type === "withdraw" ? "Retiro" :
        "Otro";

      const monto = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP"
      }).format(t.amount);

      row.innerHTML = `
        <td>${fecha}</td>
        <td>${tipo}</td>
        <td>${t.betType ?? "-"}</td>
        <td>${monto}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error cargando transacciones:", err);
  }

});
