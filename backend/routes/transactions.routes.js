// backend/routes/transactions.routes.js
const router = require("express").Router();
const Usuario = require("../models/Usuario");
const Transaccion = require("../models/Transaccion");
const auth = require("../middleware/auth");

// ====================== DEPÓSITO ======================
router.post("/deposit", auth, async (req, res) => {
  try {
    const uid = req.uid;
    const { amount } = req.body;

    const monto = parseInt(amount, 10);
    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const usuario = await Usuario.findById(uid);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    usuario.balance += monto;
    await usuario.save();

    await Transaccion.create({
      userId: uid,
      type: "deposit",
      amount: monto,
      betType: "Depósito Manual"
    });

    res.json({
      success: true,
      newBalance: usuario.balance
    });

  } catch (err) {
    console.error("Error depósito:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ====================== RETIRO ======================
router.post("/withdraw", auth, async (req, res) => {
  try {
    const uid = req.uid;
    const { amount } = req.body;

    const monto = parseInt(amount, 10);
    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const usuario = await Usuario.findById(uid);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    if (usuario.balance < monto) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    usuario.balance -= monto;
    await usuario.save();

    await Transaccion.create({
      userId: uid,
      type: "withdrawal",
      amount: -monto,
      betType: "Retiro Manual"
    });

    res.json({
      success: true,
      newBalance: usuario.balance
    });

  } catch (err) {
    console.error("Error retiro:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// ====================== ÚLTIMAS 5 TRANSACCIONES ======================
router.get("/last", auth, async (req, res) => {
  try {
    const uid = req.uid;

    const trans = await Transaccion
      .find({ userId: uid })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    res.json(trans);

  } catch (err) {
    console.error("Error obteniendo últimas transacciones:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;
