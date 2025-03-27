const express = require('express');
const jwt = require('jsonwebtoken');
const connection = require('./dbConnection');
const router = express.Router();

router.post('/api/login', (req, res) => {
    const { nombreUsuario, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE nombreUsuario = ? AND password = ?';
    connection.query(query, [nombreUsuario, password], (err, results) => {
        if (err) {
            console.error('Error al verificar el usuario:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar el usuario' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        const user = results[0];
        const token = jwt.sign(
            { userName: user.nombreUsuario, role: user.rol },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ success: true, token, role: user.rol });
    });
});

module.exports = router;