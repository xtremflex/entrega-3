// backend/routes/user.routes.js
const router = require("express").Router();
const Usuario = require("../models/Usuario");
const Transaccion = require("../models/Transaccion");
const auth = require("../middleware/auth");

// =============================
//     GET /api/user/me
// =============================
router.get("/me", auth, async (req, res) => {
  try {
    const uid = req.uid; // viene del middleware

    const user = await Usuario.findById(uid).lean();
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // IMPORTANTE: devolvemos user anidado
    res.json({
      user: {
        name: user.name,
        surname: user.surname,
        user: user.user,
        rut: user.rut,
        mail: user.mail,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error("Error en /api/user/me:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// =============================
//  GET /api/user/transactions
// =============================
router.get("/transactions", auth, async (req, res) => {
  try {
    const uid = req.uid;

    const transactions = await Transaccion.find({ userId: uid })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    res.json({ transactions });
  } catch (err) {
    console.error("Error en /api/user/transactions:", err);
    res.status(500).json({ transactions: [] });
  }
});

module.exports = router;
