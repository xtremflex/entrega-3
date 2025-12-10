const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
    const { name, surname, user, birth, rut, mail, password } = req.body;

    try {
        if (!name || !surname || !user || !rut || !mail || !password) {
            return res.status(400).json({ error: "Faltan datos." });
        }

        const exists = await Usuario.findOne({ $or: [{ rut }, { mail }] });
        if (exists) {
            return res.status(400).json({ error: "RUT o correo ya registrado." });
        }

        const hashed = await bcrypt.hash(password, 10);

        const nuevoUsuario = new Usuario({
            name, surname, user, birth, rut, mail,
            password: hashed,
            balance: 50000
        });

        await nuevoUsuario.save();

        return res.json({ message: "Usuario creado correctamente", userId: nuevoUsuario._id });

    } catch (err) {
        console.error("Error en /api/register:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
