const Usuario = require('../models/Usuario');
const Transaccion = require('../models/Transaccion');
const PartidaRuleta = require('../models/PartidaRuleta');
const roulette = require('../services/rouletteService');

module.exports = {

  // =====================================================
  //                       SPIN
  // =====================================================
  spin: async (req, res) => {
    try {
      const uid = req.cookies.uid;
      const { bets } = req.body;

      if (!uid) return res.status(401).json({ error: "No autenticado" });
      if (!bets || bets.length === 0) return res.status(400).json({ error: "No hay apuestas" });

      const usuario = await Usuario.findById(uid);
      if (!usuario) return res.status(404).json({ error: "Usuario no existe" });

      const totalBet = bets.reduce((acc, b) => acc + b.amount, 0);
      if (usuario.balance < totalBet)
        return res.status(400).json({ error: "Saldo insuficiente" });

      // Descontar saldo
      usuario.balance -= totalBet;

      // Registrar apuestas
      await Transaccion.insertMany(
        bets.map(b => ({
          userId: uid,
          type: "bet",
          amount: -b.amount,
          betType: b.type
        }))
      );

      // Número ganador
      const winningNumber = Math.floor(Math.random() * 37);
      const numberData = roulette.getNumberData(winningNumber);

      let totalWinnings = 0;
      const betResults = [];
      const winTransactions = [];

      // Evaluar apuestas
      for (const bet of bets) {
        const payoutRate = roulette.getPayoutRate(bet.type);
        const won = roulette.checkWin(bet.type, numberData);
        const payout = won ? bet.amount * payoutRate + bet.amount : 0;

        if (won) {
          totalWinnings += payout;

          winTransactions.push({
            userId: uid,
            type: "win",
            amount: payout,
            betType: bet.type,
            gameResult: winningNumber
          });
        }

        betResults.push({
          type: bet.type,
          amount: bet.amount,
          won,
          payout
        });
      }

      // Aplicar ganancias
      usuario.balance += totalWinnings;
      await usuario.save();

      // Registrar transacciones de ganancia
      if (winTransactions.length > 0)
        await Transaccion.insertMany(winTransactions);

      // Guardar partida COMPLETA
      await PartidaRuleta.create({
        userId: uid,
        winningNumber,
        color: numberData.color,
        bets: betResults,
        totalBet,
        totalWinnings
      });

      // Responder
      res.json({
        success: true,
        winningNumber,
        color: numberData.color,
        newBalance: usuario.balance,
        totalBet,
        totalWinnings,
        betResults
      });

    } catch (err) {
      console.log("Error en spin:", err);
      res.status(500).json({ error: "Error interno" });
    }
  },


  // =====================================================
  //                   ESTADO INICIAL RULETA
  // =====================================================
  state: async (req, res) => {
    try {
      const uid = req.cookies.uid;
      if (!uid) return res.status(401).json({ error: "No autenticado" });

      const usuario = await Usuario.findById(uid).lean();
      if (!usuario) return res.status(404).json({ error: "Usuario no existe" });

      // Últimos 5 números
      const lastNumbers = await PartidaRuleta
        .find()
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();

      // Últimas apuestas del usuario
      const lastBets = await Transaccion
        .find({ userId: uid, type: { $in: ["bet", "win"] } })
        .sort({ timestamp: -1 })
        .limit(5)
        .lean();

      res.json({
        balance: usuario.balance,
        lastNumbers,
        lastBets
      });

    } catch (err) {
      console.log("Error en state:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }

};
