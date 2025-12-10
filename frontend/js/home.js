document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-comenzar");

  btn.addEventListener("click", async () => {
    try {
      // Preguntar al backend si está logeado
      const res = await fetch("/api/user/me", {
        credentials: "include"
      });

      const data = await res.json();

      // No autenticado → enviar a login
      if (data.error) {
        window.location.href = "/frontend/pages/login.html";
        return;
      }

      // Sí autenticado → enviar a ruleta
      window.location.href = "/frontend/pages/roulette.html";

    } catch (err) {
      console.error("Error verificando sesión:", err);
      window.location.href = "/frontend/pages/login.html";
    }
  });
});
