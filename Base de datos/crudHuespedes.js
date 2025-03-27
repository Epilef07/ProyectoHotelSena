const connection = require('./dbConnection');

// Función para agregar un nuevo huésped a la base de datos
function agregarHuesped(huesped, callback) {
    const query = 'INSERT INTO huesped SET ?';
    connection.query(query, huesped, (err, results) => {
        if (err) {
            console.error('Error al agregar huésped:', err);
            return callback(err);
        }
        console.log('Huésped agregado exitosamente:', results);
        callback(null, results);
    });
}

// Función para buscar un huésped en la base de datos por su id
function buscarHuesped(id, callback) {
    const query = 'SELECT * FROM huesped WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al buscar huésped:', err);
            return callback(err);
        }
        console.log('Huésped encontrado:', results);
        callback(null, results);
    });
}

// Función para actualizar un huésped en la base de datos por su id
function actualizarHuesped(id, huesped, callback) {
    const query = 'UPDATE huesped SET ? WHERE id = ?';
    console.log('Actualizando huésped con ID:', id);
    console.log('Datos del huésped:', huesped);
    connection.query(query, [huesped, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar huésped:', err);
            return callback(err);
        }
        console.log('Huésped actualizado exitosamente:', results);
        callback(null, results);
    });
}

module.exports = {
    agregarHuesped,
    buscarHuesped,
    actualizarHuesped
};