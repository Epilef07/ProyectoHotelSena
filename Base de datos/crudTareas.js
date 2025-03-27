const connection = require('./dbConnection');

// Función para agregar una tarea
function agregarTarea(tarea, callback) {
    const query = 'INSERT INTO tareas (descripcion, idAdministrador, idAprendiz) VALUES (?, ?, ?)';
    const values = [tarea.descripcion, 1, 1]; // Valores predeterminados para idAdministrador e idAprendiz
    connection.query(query, values, callback);
}

// Función para obtener todas las tareas
function obtenerTareas(callback) {
    const query = 'SELECT * FROM tareas';
    connection.query(query, callback);
}

// Función para actualizar una tarea
function actualizarTarea(id, tarea, callback) {
    const query = 'UPDATE tareas SET descripcion = ? WHERE id = ?';
    const values = [tarea.descripcion, id];
    connection.query(query, values, callback);
}

// Función para eliminar una tarea
function eliminarTarea(id, callback) {
    const query = 'DELETE FROM tareas WHERE id = ?';
    connection.query(query, [id], callback);
}

module.exports = {
    agregarTarea,
    obtenerTareas,
    actualizarTarea,
    eliminarTarea
};