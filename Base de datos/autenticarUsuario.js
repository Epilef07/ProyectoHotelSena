const jwt = require('jsonwebtoken');

// Middleware para autenticar usuarios
function autenticarUsuario(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No se proporcionó un token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Usar la clave secreta desde las variables de entorno
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token de autenticación inválido' });
    }
}

module.exports = autenticarUsuario;