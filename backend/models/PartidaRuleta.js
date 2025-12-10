const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  won: { type: Boolean, required: true },
  payout: { type: Number, required: true }
});

const PartidaRuletaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  winningNumber: Number,
  color: String,

  bets: { type: [BetSchema], default: [] },

  totalBet: Number,
  totalWinnings: Number,

  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PartidaRuleta", PartidaRuletaSchema);

