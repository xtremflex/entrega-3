document.addEventListener("DOMContentLoaded", async () => {
  const access = document.getElementById("access-buttons");
  if (!access) return; // La página no tiene botones

  try {
    const res = await fetch("/api/user/me");
    const data = await res.json();

    // --- Usuario NO logueado ---
    if (!data || !data.user) {
      access.innerHTML = `
        <a href="/frontend/pages/register.html" class="btn btn-acceso">Registro</a>
        <a href="/frontend/pages/login.html" class="btn btn-acceso">Iniciar Sesión</a>
      `;
      return;
    }

    // --- Usuario SI logueado ---
    access.innerHTML = `
      <a href="/frontend/pages/profile.html" class="btn btn-acceso">Perfil</a>
      <a id="logout-link" class="btn btn-acceso btn-logout">Cerrar Sesión</a>
    `;

    // Evento logout
    document.getElementById("logout-link").addEventListener("click", async (e) => {
      e.preventDefault();

      await fetch("/api/auth/logout", { method: "POST" });

      window.location.href = "/frontend/pages/home.html";
    });

  } catch (err) {
    console.error("Error verificando sesión:", err);
  }
});
