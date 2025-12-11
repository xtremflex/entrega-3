// ================================
//   AUTENTICACIÓN BETANITO
// ================================

// ---- REGISTRO ----
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      surname: document.getElementById("surname").value,
      user: document.getElementById("user").value,
      birth: document.getElementById("birth").value,
      rut: document.getElementById("rut").value,
      mail: document.getElementById("mail").value,
      password: document.getElementById("password").value
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  
        body: JSON.stringify(data)
      });

      const json = await res.json();
      if (!res.ok) {
        document.getElementById("registerError").innerText = json.error || "Error al registrarse";
        return;
      }

      // Registro exitoso → enviar al login
      window.location.href = "/frontend/pages/login.html";

    } catch (err) {
      document.getElementById("registerError").innerText = "Error en el servidor";
    }
  });
}



// ---- LOGIN ----
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rut = document.getElementById("rut").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ rut, password })
      });

      const json = await res.json();

      if (!res.ok) {
        document.getElementById("loginError").innerText = json.error || "Credenciales incorrectas";
        return;
      }

      // Inicio correcto → enviar al home
      window.location.href = "/frontend/pages/home.html";

    } catch (err) {
      document.getElementById("loginError").innerText = "Error del servidor";
    }
  });
}



// ---- LOGOUT ----
const logoutBtn = document.getElementById("btn-logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include" 
      });

      window.location.href = "/frontend/pages/home.html";

    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  });
}
