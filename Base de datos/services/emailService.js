const nodemailer = require('nodemailer');

// Remover cualquier uso idéntico a "service" para forzar el uso de la configuración manual
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,           // Se usa el puerto 465 en lugar de 587
    secure: true,        // Activar conexión segura (SSL/TLS)
    auth: {
        user: 'senadream2@gmail.com',
        pass: 'xkwx ftxh bxzj qsqj' // Reemplaza por la contraseña de aplicación correcta
    },
    tls: {
        rejectUnauthorized: false
    }
});

const emailService = {
    sendPasswordReset: async (email, resetLink) => {
        try {
            const mailOptions = {
                from: 'senadream2@gmail.com', // Asegúrate de que coincida con el correo de autenticación
                to: email,
                subject: 'Recordatorio de Contraseña - Hotel SENA',
                html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio de Contraseña</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #28a745;
            color: #ffffff;
            padding: 15px;
            font-size: 22px;
            font-weight: bold;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .content p {
            font-size: 18px;
            color: #333333;
        }
        .highlight {
            font-size: 20px;
            font-weight: bold;
            color: #28a745;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #777777;
            text-align: center;
        }
        .button {
            background: #28a745;
            color: #ffffff;
            padding: 12px 20px;
            font-size: 18px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            📩 Recordatorio de Contraseña
        </div>
        <div class="content">
            <p><strong>HOLA</strong></p>
            <p>Te recordamos que tu contraseña de usuario es tu <strong>ID o Documento de Identidad</strong>.</p>
            <p class="highlight">{NUMERO_DOCUMENTO}</p>
            <p>Si no solicitaste este recordatorio, puedes ignorar este mensaje.</p>
            <a href="{URL_LOGIN}" class="button">Iniciar Sesión</a>
        </div>
        <div class="footer">
            <p>© 2025 Tu Empresa - Todos los derechos reservados</p>
        </div>
    </div>
</body>
</html>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Correo enviado:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }
};

module.exports = emailService;
