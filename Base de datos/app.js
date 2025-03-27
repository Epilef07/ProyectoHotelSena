const connection = require('./dbConnection');

// Realizar una consulta
connection.query('SELECT * FROM hotel', (err, results, fields) => {
    if (err) {
        console.error('Error en la consulta:', err.stack);
        return;
    }
    console.log('Resultados de la consulta:', results);
});

// Cerrar la conexión cuando ya no la necesites
connection.end();