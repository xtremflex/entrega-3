const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

module.exports = {

  // =====================================================
  //                     REGISTRO
  // =====================================================
  register: async (req, res) => {
    try {
      const { name, surname, user, birth, rut, mail, password } = req.body;

      if (!name || !surname || !user || !rut || !mail || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      // Verificar si el RUT YA existe
      const existe = await Usuario.findOne({ rut });
      if (existe) {
        return res.status(400).json({ error: "El RUT ya está registrado" });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const nuevoUsuario = new Usuario({
        name,
        surname,
        user,
        birth,
        rut,
        mail,
        password: hashedPassword,
        balance: 0
      });

      await nuevoUsuario.save();

      res.json({ success: true });

    } catch (err) {
      console.log("Error en registro:", err);
      res.status(500).json({ error: "Error interno" });
    }
  },

  // =====================================================
  //                     LOGIN (RUT)
  // =====================================================
  login: async (req, res) => {
    try {
      const { rut, password } = req.body;

      if (!rut || !password) {
        return res.status(400).json({ error: "RUT y contraseña son obligatorios" });
      }

      // Buscar usuario por RUT
      const usuario = await Usuario.findOne({ rut });

      if (!usuario) {
        return res.status(400).json({ error: "Usuario o contraseña incorrecta" });
      }

      // Comparar contraseñas
      const ok = await bcrypt.compare(password, usuario.password);
      if (!ok) {
        return res.status(400).json({ error: "Usuario o contraseña incorrecta" });
      }

      // Crear cookie de sesión
      res.cookie("uid", usuario._id, {
        httpOnly: true,
        sameSite: "lax"
      });

      res.json({ success: true });

    } catch (err) {
      console.log("Error en login:", err);
      res.status(500).json({ error: "Error interno" });
    }
  },

  // =====================================================
  //                     LOGOUT
  // =====================================================
  logout: (req, res) => {
    try {
      res.clearCookie("uid");
      res.json({ success: true });
    } catch (err) {
      console.log("Error en logout:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

};
