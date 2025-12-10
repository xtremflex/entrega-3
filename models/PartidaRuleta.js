const mongoose = require('mongoose')

const PartidaRuletaSchema = new mongoose.Schema({
  winningNumber: { type: Number, required: true },
  color: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const PartidaRuleta = mongoose.model('PartidaRuleta', PartidaRuletaSchema)

module.exports = PartidaRuleta
