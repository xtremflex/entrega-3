const Usuario = require('../models/Usuario');
const Transaccion = require('../models/Transaccion');

module.exports = {
  list: async (req, res) => {
    try {
      const uid = req.cookies.uid;
      if (!uid) return res.status(401).json({ error: "No autenticado" });

      const trans = await Transaccion.find({ userId: uid })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();

      res.json(trans);

    } catch (err) {
      console.log("Error en list:", err);
      res.status(500).json({ error: "Error interno" });
    }
  },

  deposit: async (req, res) => {
    try {
      const uid = req.cookies.uid;
      const { amount } = req.body;

      if (!uid) return res.status(401).json({ error: "No autenticado" });
      if (!amount || amount <= 0)
        return res.status(400).json({ error: "Monto inválido" });

      const usuario = await Usuario.findById(uid);

      usuario.balance += amount;
      await usuario.save();

      await Transaccion.create({
        userId: uid,
        type: "deposit",
        amount,
        betType: "Depósito Manual"
      });

      res.json({ success: true, newBalance: usuario.balance });

    } catch (err) {
      console.log("Error en deposit:", err);
      res.status(500).json({ error: "Error interno" });
    }
  },

  withdraw: async (req, res) => {
    try {
      const uid = req.cookies.uid;
      const { amount } = req.body;

      if (!uid) return res.status(401).json({ error: "No autenticado" });
      if (!amount || amount <= 0)
        return res.status(400).json({ error: "Monto inválido" });

      const usuario = await Usuario.findById(uid);

      if (usuario.balance < amount)
        return res.status(400).json({ error: "Saldo insuficiente" });

      usuario.balance -= amount;
      await usuario.save();

      await Transaccion.create({
        userId: uid,
        type: "withdrawal",
        amount: -amount,
        betType: "Retiro Manual"
      });

      res.json({ success: true, newBalance: usuario.balance });

    } catch (err) {
      console.log("Error en withdraw:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }
};
