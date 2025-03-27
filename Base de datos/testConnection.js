const connection = require('./dbConnection');

connection.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('Error ejecutando la consulta de prueba:', err);
        process.exit(1);
    }
    console.log('Conexión a la base de datos exitosa:', results);
    process.exit(0);
});