const mysql = require('mysql2');

// Crear una conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost', // Cambia esto si tu base de datos está en otro host
    user: 'root', // Reemplaza con tu usuario de la base de datos
    password: 'andres123', // Reemplaza con tu contraseña de la base de datos
    database: 'hoteleria' // Reemplaza con el nombre de tu base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
        return;
    }
    console.log('Conectado a la base de datos como id ' + connection.threadId);
});

// Exportar la conexión para usarla en otros archivos
module.exports = connection;