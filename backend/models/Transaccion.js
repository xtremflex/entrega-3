const mongoose = require('mongoose')

const TransaccionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'bet', 'win'], required: true },
  amount: { type: Number, required: true },
  betType: { type: String, default: null },
  gameResult: { type: Number, default: null },
  timestamp: { type: Date, default: Date.now }
})

const Transaccion = mongoose.model('Transaccion', TransaccionSchema)

module.exports = Transaccion
