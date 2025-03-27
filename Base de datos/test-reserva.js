const { agregarReserva } = require('./reservaciones');

// Datos de ejemplo - REEMPLAZA CON DATOS VÁLIDOS DE TU BASE DE DATOS
const reservaPrueba = {
    numeroHabitacion: 502,  // Debe existir en tu tabla habitacion
    idHuesped: 1,        // Debe existir en tu tabla huesped
    fechaIngreso: '2025-03-01',
    fechaSalida: '2025-03-05',
    abono: 10
};

console.log('Iniciando prueba de reserva con datos:', reservaPrueba);

// Llamar a la función directamente
agregarReserva(reservaPrueba, (err, results) => {
    if (err) {
        console.error('ERROR EN LA PRUEBA:', err.message);
    } else {
        console.log('PRUEBA EXITOSA. Resultados:', results);
    }
    // Cerrar la conexión para terminar el script
    require('./dbConnection').end();
});