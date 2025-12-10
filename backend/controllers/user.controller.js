const Usuario = require('../models/Usuario');

module.exports = {
  getProfile: async (req, res) => {
    try {
      const uid = req.cookies.uid;

      if (!uid) return res.status(401).json({ error: "No autenticado" });

      const usuario = await Usuario.findById(uid).lean();

      if (!usuario) return res.status(404).json({ error: "No encontrado" });

      res.json({
        name: usuario.name,
        surname: usuario.surname,
        user: usuario.user,
        rut: usuario.rut,
        mail: usuario.mail,
        balance: usuario.balance
      });

    } catch (err) {
      console.log("Error en getProfile:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }
};
