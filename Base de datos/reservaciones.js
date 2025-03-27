const connection = require('./dbConnection');

// Función para agregar una reserva
function agregarReserva(reserva, callback) {
    const query = `
        INSERT INTO reserva (numeroHabitacion, idHuesped, tipoPersona, fechaIngreso, fechaSalida, abono, cantidadAcompanantes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        reserva.numeroHabitacion,
        reserva.idHuesped,
        reserva.tipoPersona, // Nuevo campo
        reserva.fechaIngreso,
        reserva.fechaSalida,
        reserva.abono,
        reserva.cantidadAcompanantes || 0 // Valor predeterminado de 0 si no se proporciona
    ];

    console.log('Iniciando la función agregarReserva'); // Agregar log para depuración
    console.log('Query:', query); // Agregar log para depuración
    console.log('Values:', values); // Agregar log para depuración

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al agregar la reserva:', err.message, err.code);
            console.error('Detalles del error:', err); // Agregar detalles del error
            return callback(new Error(`No se pudo agregar la reserva: ${err.message}`));
        }
        console.log('Resultados de la consulta de inserción:', results); // Confirmar éxito
        console.log('Reserva agregada correctamente'); // Mensaje de éxito
        callback(null, results);
    });
}

// Función para obtener las reservas actuales
function obtenerReservas(callback) {
    const query = `
        SELECT 
            r.codigoReserva,
            r.numeroHabitacion,
            r.idHuesped,
            r.tipoPersona,
            r.fechaIngreso,
            r.fechaSalida,
            r.abono,
            r.cantidadAcompanantes, -- Incluir el nuevo campo
            dr.minibarConsumido,
            dr.cantidadConsumida,
            dr.descripcionConsumo
        FROM reserva r
        LEFT JOIN detalle_reserva dr ON r.codigoReserva = dr.codigoReserva
        WHERE r.fechaSalida >= CURDATE()
    `;

    console.log('Iniciando la función obtenerReservas'); // Agregar log para depuración
    console.log('Query:', query); // Agregar log para depuración

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las reservas:', err.message, err.code);
            console.error('Detalles del error:', err); // Agregar detalles del error
            return callback(new Error(`No se pudo obtener las reservas: ${err.message}`));
        }
        console.log('Resultados de la consulta de selección:', results); // Confirmar éxito
        callback(null, results);
    });
}

// Función para agregar acompañantes
function agregarAcompanantes(codigoReserva, acompanantes, callback) {
    const query = `
        INSERT INTO huesped_reserva (codigoReserva, idHuesped) 
        VALUES ?
    `;
    const values = acompanantes.map(acompanante => [codigoReserva, acompanante.idHuesped]);

    console.log('Iniciando la función agregarAcompanantes'); // Agregar log para depuración
    console.log('Query:', query); // Agregar log para depuración
    console.log('Values:', values); // Agregar log para depuración

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error('Error al agregar los acompañantes:', err.message, err.code);
            console.error('Detalles del error:', err); // Agregar detalles del error
            return callback(new Error(`No se pudieron agregar los acompañantes: ${err.message}`));
        }
        console.log('Resultados de la consulta de inserción de acompañantes:', results); // Confirmar éxito
        callback(null, results);
    });
}

// Función para editar una reserva
function editarReserva(codigoReserva, reserva, callback) {
    const query = `
        UPDATE reserva 
        SET 
            numeroHabitacion = ?, 
            idHuesped = ?, 
            tipoPersona = ?, 
            fechaIngreso = ?, 
            fechaSalida = ?, 
            abono = ?, 
            cantidadAcompañante = ? -- Cambiar a "cantidadAcompañante"
        WHERE codigoReserva = ?
    `;
    const values = [
        reserva.numeroHabitacion,
        reserva.idHuesped,
        reserva.tipoPersona,
        reserva.fechaIngreso,
        reserva.fechaSalida,
        reserva.abono,
        reserva.cantidadAcompañante || 0, // Cambiar a "cantidadAcompañante"
        codigoReserva
    ];

    console.log('Iniciando la función editarReserva'); // Agregar log para depuración
    console.log('Query:', query); // Agregar log para depuración
    console.log('Values:', values); // Agregar log para depuración

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error al editar la reserva:', err.message, err.code);
            console.error('Detalles del error:', err); // Agregar detalles del error
            return callback(new Error(`No se pudo editar la reserva: ${err.message}`));
        }
        console.log('Resultados de la consulta de actualización:', results); // Confirmar éxito
        callback(null, results);
    });
}

module.exports = {
    agregarReserva,
    obtenerReservas,
    agregarAcompanantes,
    editarReserva
};