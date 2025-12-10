const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
  name: String,
  surname: String,
  user: String,
  birth: Date,
  rut: {
    type: String,
    required: true,
    unique: true
  },
  mail: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  }
})

const Usuario = mongoose.model('Usuario', UsuarioSchema)

module.exports = Usuario
