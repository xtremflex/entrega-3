const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

module.exports = {

  register: async (req, res) => {
    try {
      const { name, surname, user, birth, rut, mail, password } = req.body;

      if (!name || !surname || !user || !rut || !mail || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      const existe = await Usuario.findOne({ rut });
      if (existe) {
        return res.status(400).json({ error: "El RUT ya está registrado" });
      }
      
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

  login: async (req, res) => {
    try {
      const { rut, password } = req.body;

      if (!rut || !password) {
        return res.status(400).json({ error: "RUT y contraseña son obligatorios" });
      }

      const usuario = await Usuario.findOne({ rut });

      if (!usuario) {
        return res.status(400).json({ error: "Usuario o contraseña incorrecta" });
      }

      const ok = await bcrypt.compare(password, usuario.password);
      if (!ok) {
        return res.status(400).json({ error: "Usuario o contraseña incorrecta" });
      }

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
