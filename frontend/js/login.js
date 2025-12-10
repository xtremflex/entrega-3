document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rut = document.getElementById("rut").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",  // ← NECESARIO PARA GUARDAR COOKIE
      body: JSON.stringify({ rut, password })
    });

    const data = await res.json();

    if (data.error) {
      alert("Credenciales incorrectas");
      return;
    }

    window.location.href = "/frontend/pages/home.html";
  });
});
