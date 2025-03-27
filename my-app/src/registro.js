document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Recargar la página después de un registro exitoso
            window.location.reload();
        } else {
            const mensajeDiv = document.getElementById('registroMensaje');
            mensajeDiv.innerHTML = '<p style="color: red;">' + result.message + '</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const mensajeDiv = document.getElementById('registroMensaje');
        mensajeDiv.innerHTML = '<p style="color: red;">Error al registrar aprendiz</p>';
    });
});

const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./dbConnection');

const app = express();
const port = 3001; // Cambia el puerto aquí

app.use(bodyParser.json());

// Función para generar un ID único
function generateUniqueId() {
    return Date.now(); // Genera un ID basado en la fecha y hora actual
}

// Ruta para manejar el registro de aprendices
app.post('/api/register', (req, res) => {
    const { tipoDocumento, numeroDocumento, nombreCompleto, telefono, numeroFicha, correoElectronico } = req.body;

    const query = 'INSERT INTO aprendiz (id, idAdministrador, tipoDocumento, numeroDocumento, numeroFicha, nombreCompleto, telefono, correoElectronico, fechaHoraIngreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        generateUniqueId(), // Genera un ID único
        1, // ID del administrador, puedes cambiarlo según tu lógica
        tipoDocumento,
        numeroDocumento,
        numeroFicha,
        nombreCompleto,
        telefono,
        correoElectronico,
        new Date()
    ];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al registrar aprendiz:', err);
            return res.status(500).json({ success: false, message: 'Error al registrar aprendiz' });
        }
        console.log('Aprendiz registrado exitosamente:', results);
        res.status(200).json({ success: true, message: 'Aprendiz registrado exitosamente' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
