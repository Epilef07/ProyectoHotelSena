const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connection = require('./dbConnection');
const { agregarHuesped, buscarHuesped, actualizarHuesped } = require('./crudHuespedes');
const { agregarTarea, obtenerTareas, actualizarTarea, eliminarTarea } = require('./crudTareas');
const { agregarReserva, obtenerReservas } = require('./reservaciones'); // Ruta corregida
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Asegúrate de que esto esté presente

app.use(session({
    secret: 'clave-secreta', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Usa `true` si estás usando HTTPS
}));

// Servir archivos estáticos desde las diferentes carpetas
app.use(express.static(path.join(__dirname, '../my-app/HTML')));
app.use('/CSS', express.static(path.join(__dirname, '../my-app/CSS')));
app.use('/JS', express.static(path.join(__dirname, '../my-app/JS')));
app.use('/IMAGENES', express.static(path.join(__dirname, '../my-app/IMAGENES')));

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../my-app/HTML/index.html'));
});

// Ruta para servir otros archivos HTML
app.get('/HTML/:file', (req, res) => {
    const file = req.params.file;
    res.sendFile(path.join(__dirname, `../my-app/HTML/${file}`));
});

// Ruta para manejar el registro de aprendices
app.post('/api/register', (req, res) => {
    const { tipoDocumento, numeroDocumento, nombreCompleto, telefono, numeroFicha, correoElectronico } = req.body;

    const query = 'INSERT INTO aprendiz (id, idAdministrador, tipoDocumento, numeroFicha, nombreCompleto, telefono, correoElectronico, fechaHoraIngreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        numeroDocumento, // Usar el número de documento como ID
        1, // ID del administrador, puedes cambiarlo según tu lógica
        tipoDocumento,
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
        res.redirect('/HTML/index.html'); // Redirigir a la página de inicio después de un registro exitoso
    });
});

// Ruta para manejar el inicio de sesión
app.post('/api/login', (req, res) => {
    const { nombreUsuario, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE nombreUsuario = ? AND password = ?';
    connection.query(query, [nombreUsuario, password], (err, results) => {
        if (err) {
            console.error('Error al iniciar sesión:', err);
            return res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Guardar el usuario y el rol en la sesión
            req.session.usuarioId = user.id;
            req.session.rol = user.rol; // Guardar el rol en la sesión

            if (user.rol === 'admin') {
                return res.json({ 
                    success: true, 
                    message: 'Inicio de sesión exitoso', 
                    rol: 'admin', 
                    nombreUsuario: user.nombreUsuario, 
                    redirect: '/HTML/menu.html' 
                });
            } else if (user.rol === 'user') {
                const updateQuery = `
                    UPDATE aprendiz 
                    SET fechaHoraIngreso = NOW() 
                    WHERE id = ?
                `;
                connection.query(updateQuery, [user.idAprendiz], (err) => {
                    if (err) {
                        console.error('Error al actualizar fechaHoraIngreso:', err);
                        return res.status(500).json({ message: 'Error al actualizar la hora de ingreso' });
                    }

                    return res.json({ 
                        success: true, 
                        message: 'Inicio de sesión exitoso', 
                        rol: 'user', 
                        nombreUsuario: user.nombreUsuario, 
                        redirect: '/HTML/menuUser.html' 
                    });
                });
            } else {
                return res.status(400).json({ success: false, message: 'Rol desconocido' });
            }
        } else {
            return res.status(401).json({ success: false, message: 'Nombre de usuario o contraseña incorrectos' });
        }
    });
});

// Ruta para manejar el registro de huéspedes
app.post('/api/huespedes', (req, res) => {
    const nuevoHuesped = req.body;
    agregarHuesped(nuevoHuesped, (err, results) => {
        if (err) {
            return res.status(500).send('Error al agregar huésped');
        }
        res.status(200).json(results);
    });
});

// Ruta para buscar huéspedes por documento
app.get('/api/huespedes/:documento', (req, res) => {
    const documento = req.params.documento;
    buscarHuesped(documento, (err, results) => {
        if (err) {
            return res.status(500).send('Error al buscar huésped');
        }
        res.status(200).json(results);
    });
});

// Ruta para obtener un huésped por ID
app.get('/api/huespedes/:id', (req, res) => {
    const id = req.params.id;
    buscarHuesped(id, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al buscar el huésped' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Huésped no encontrado' });
        }
        res.json(results);
    });
});

// Ruta para actualizar un huésped por ID
app.put('/api/huespedes/:id', (req, res) => {
    const id = req.params.id;
    const updatedHuesped = req.body;
    console.log('Solicitud de actualización recibida para ID:', id);
    console.log('Datos actualizados del huésped:', updatedHuesped);
    actualizarHuesped(id, updatedHuesped, (err, results) => {
        if (err) {
            console.error('Error al actualizar el huésped:', err);
            return res.status(500).json({ message: 'Error al actualizar el huésped', error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Huésped no encontrado' });
        }
        res.json({ message: 'Huésped actualizado exitosamente', results });
    });
});

// Ruta para agregar una tarea
app.post('/api/tareas', (req, res) => {
    const { descripcion } = req.body;

    if (!req.session.usuarioId) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const usuarioId = req.session.usuarioId;

    const query = 'INSERT INTO tareas (descripcion, idUsuario) VALUES (?, ?)';
    connection.query(query, [descripcion, usuarioId], (err, results) => {
        if (err) {
            console.error('Error al agregar la tarea:', err);
            return res.status(500).json({ message: 'Error al agregar la tarea' });
        }
        res.json({ success: true, results });
    });
});

// Ruta para obtener todas las tareas
app.get('/api/tareas', (req, res) => {
    if (!req.session.usuarioId) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const usuarioId = req.session.usuarioId;
    const rol = req.session.rol; // Asegúrate de guardar el rol en la sesión al iniciar sesión

    let query;
    let params;

    if (rol === 'admin') {
        // Si el usuario es administrador, obtener todas las tareas
        query = `
            SELECT t.id, t.descripcion, u.nombreUsuario
            FROM tareas t
            JOIN usuarios u ON t.idUsuario = u.id
        `;
        params = [];
    } else {
        // Si el usuario es normal, obtener solo sus tareas
        query = `
            SELECT t.id, t.descripcion, u.nombreUsuario
            FROM tareas t
            JOIN usuarios u ON t.idUsuario = u.id
            WHERE t.idUsuario = ?
        `;
        params = [usuarioId];
    }

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error('Error al obtener las tareas:', err);
            return res.status(500).json({ message: 'Error al obtener las tareas' });
        }
        res.json(results);
    });
});

// Ruta para actualizar una tarea
app.put('/api/tareas/:id', (req, res) => {
    const id = req.params.id;
    const tareaActualizada = { descripcion: req.body.descripcion };
    actualizarTarea(id, tareaActualizada, (err, results) => {
        if (err) {
            console.error('Error al actualizar la tarea:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar la tarea' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        }
        res.json({ success: true, message: 'Tarea actualizada exitosamente', results });
    });
});

// Ruta para eliminar una tarea
app.delete('/api/tareas/:id', (req, res) => {
    const id = req.params.id;
    eliminarTarea(id, (err, results) => {
        if (err) {
            console.error('Error al eliminar la tarea:', err);
            return res.status(500).json({ success: false, message: 'Error al eliminar la tarea' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
        }
        res.json({ success: true, message: 'Tarea eliminada exitosamente', results });
    });
});

// Ruta para agregar una reserva

app.get('/api/habitaciones-disponibles', (_, res) => {
    const query = `SELECT numeroHabitacion FROM hoteleria.habitacion WHERE ocupada = 0`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener habitaciones disponibles:', err);
            return res.status(500).json({ success: false, message: 'Error en el servidor' });
        }
        res.json(results);
    });
});


app.get('/api/habitaciones', (req, res) => {
    const query = `SELECT numeroHabitacion, ocupada FROM habitacion`; // Cambiado de "habitaciones" a "habitacion"

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener las habitaciones:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener las habitaciones.' });
        }

        res.json(results); // Devuelve todas las habitaciones
    });
});


app.post('/api/reservas', (req, res) => {
    console.log("🔹 Datos recibidos:", req.body);

    const { 
        numeroHabitacion, 
        idHuesped, 
        tipoPersona, 
        fechaIngreso, 
        fechaSalida, 
        abono,
        cantidadAcompanantes // Asegúrate de recibir este campo
    } = req.body;

    if (!['funcionario', 'externa'].includes(tipoPersona)) {
        return res.status(400).json({ success: false, message: '⚠️ Tipo de persona inválido' });
    }

    if (new Date(fechaSalida) <= new Date(fechaIngreso)) {
        return res.status(400).json({ success: false, message: '⚠️ La fecha de salida debe ser posterior a la de ingreso' });
    }

    const queryVerificar = `
        SELECT * FROM hoteleria.reserva
        WHERE numeroHabitacion = ? 
        AND ((fechaIngreso BETWEEN ? AND ?) OR (fechaSalida BETWEEN ? AND ?) OR (? BETWEEN fechaIngreso AND fechaSalida))`;

    const queryReserva = `
        INSERT INTO hoteleria.reserva 
        (numeroHabitacion, idHuesped, tipoPersona, fechaIngreso, fechaSalida, abono, cantidadAcompañante) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const queryOcupada = `UPDATE hoteleria.habitacion SET ocupada = 1 WHERE numeroHabitacion = ?`;

    connection.query(queryVerificar, [numeroHabitacion, fechaIngreso, fechaSalida, fechaIngreso, fechaSalida, fechaIngreso], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: '⚠️ Error al verificar la reserva' });
        if (results.length > 0) return res.status(400).json({ success: false, message: '❌ Habitación ya reservada en estas fechas' });

        connection.beginTransaction(err => {
            if (err) return res.status(500).json({ success: false, message: '⚠️ Error en transacción' });

            connection.query(queryReserva, [numeroHabitacion, idHuesped, tipoPersona, fechaIngreso, fechaSalida, abono, cantidadAcompanantes || 0], (err, results) => {
                if (err) return connection.rollback(() => res.status(500).json({ success: false, message: '⚠️ Error al registrar la reserva' }));

                const codigoReserva = results.insertId;

                connection.query(queryOcupada, [numeroHabitacion], (err) => {
                    if (err) return connection.rollback(() => res.status(500).json({ success: false, message: '⚠️ Error al actualizar ocupación' }));

                    connection.commit(err => {
                        if (err) return connection.rollback(() => res.status(500).json({ success: false, message: '⚠️ Error al confirmar reserva' }));
                        res.json({ success: true, message: '✅ Reserva realizada con éxito' });
                    });
                });
            });
        });
    });
});


app.get('/api/calendario', (req, res) => {
    const query = `
        SELECT r.numeroHabitacion, r.fechaIngreso, r.fechaSalida, h.ocupada 
        FROM hoteleria.reserva r
        JOIN hoteleria.habitacion h ON r.numeroHabitacion = h.numeroHabitacion
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener reservas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener reservas' });
        }
        res.json(results);
    });
});


function liberarHabitaciones() {
    const query = `
        UPDATE hoteleria.habitacion h
        JOIN hoteleria.reserva r ON h.numeroHabitacion = r.numeroHabitacion
        SET h.ocupada = 0
        WHERE r.fechaSalida < CURDATE() AND h.ocupada = 1;
    `;

    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error al liberar habitaciones:', err);
            return;
        }
        console.log(`✔ Habitaciones liberadas: ${result.affectedRows}`);
    });
}

/////Inicio de crud
// Mostrar las reservas
app.get('/api/reserva', (req, res) => {
    const query = `
        SELECT 
            r.codigoReserva,
            r.numeroHabitacion,
            r.idHuesped,
            r.fechaIngreso,
            r.fechaSalida,
            r.abono,
            r.cantidadAcompañante, -- Cambiar a "cantidadAcompañante"
            MAX(dr.minibarConsumido) AS minibarConsumido,
            MAX(dr.cantidadConsumida) AS cantidadConsumida,
            GROUP_CONCAT(hr.idHuesped) AS acompanantes
        FROM hoteleria.reserva r
        LEFT JOIN detalle_reserva dr ON r.codigoReserva = dr.codigoReserva
        LEFT JOIN huesped_reserva hr ON r.codigoReserva = hr.codigoReserva
        GROUP BY r.codigoReserva;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener reservas:', err);
            return res.status(500).json({ message: 'Error al obtener reservas' });
        }
        res.json(results);
    });
});

// Obtener una reserva específica por códigoReserva
app.get('/api/reserva/:codigoReserva', (req, res) => {
    const { codigoReserva } = req.params;

    // Consulta principal para obtener los datos de la reserva
    const queryReserva = `
        SELECT 
            r.codigoReserva,
            r.numeroHabitacion,
            r.idHuesped,
            r.tipoPersona,
            r.fechaIngreso,
            r.fechaSalida,
            r.abono,
            r.cantidadAcompañante
        FROM reserva r
        WHERE r.codigoReserva = ?
    `;

    // Consulta para obtener los acompañantes
    const queryAcompanantes = `
        SELECT idHuesped AS documento
        FROM huesped_reserva
        WHERE codigoReserva = ?
    `;

    // Consulta para obtener los productos del minibar consumidos
    const queryMinibar = `
        SELECT 
            pm.id AS productoId,
            pm.nombre AS producto,
            pm.precio,
            ap.cantidad AS cantidadAsignada,
            dr.cantidadConsumida
        FROM 
            producto_minibar pm
        LEFT JOIN 
            asignacion_producto ap ON pm.id = ap.productoId
        LEFT JOIN 
            detalle_reserva dr ON pm.id = dr.productoId AND dr.codigoReserva = ?
        WHERE 
            ap.numeroHabitacion = (SELECT numeroHabitacion FROM reserva WHERE codigoReserva = ?)
    `;

    // Ejecutar la consulta principal
    connection.query(queryReserva, [codigoReserva], (err, reservaResults) => {
        if (err) {
            console.error('Error al obtener la reserva:', err);
            return res.status(500).json({ message: 'Error al obtener la reserva' });
        }

        if (reservaResults.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        const reserva = reservaResults[0];

        // Ejecutar la consulta para los acompañantes
        connection.query(queryAcompanantes, [codigoReserva], (err, acompanantesResults) => {
            if (err) {
                console.error('Error al obtener los acompañantes:', err);
                return res.status(500).json({ message: 'Error al obtener los acompañantes' });
            }

            reserva.acompanantes = acompanantesResults;

            // Ejecutar la consulta para los productos del minibar
            connection.query(queryMinibar, [codigoReserva, codigoReserva], (err, minibarResults) => {
                if (err) {
                    console.error('Error al obtener los productos del minibar:', err);
                    return res.status(500).json({ message: 'Error al obtener los productos del minibar' });
                }

                reserva.minibar = minibarResults;

                // Enviar la respuesta combinada
                res.json(reserva);
            });
        });
    });
});

// Actulizar una reserva
app.put('/api/reserva/:codigoReserva', (req, res) => {
    const { codigoReserva } = req.params;
    const { numeroHabitacion, idHuesped, tipoPersona, fechaIngreso, fechaSalida, abono, cantidadAcompañante, minibar, acompanantes } = req.body;

    const queryReserva = `
        UPDATE reserva 
        SET numeroHabitacion = ?, idHuesped = ?, tipoPersona = ?, fechaIngreso = ?, fechaSalida = ?, abono = ?, cantidadAcompañante = ?
        WHERE codigoReserva = ?
    `;

    const valuesReserva = [numeroHabitacion, idHuesped, tipoPersona, fechaIngreso, fechaSalida, abono, cantidadAcompañante, codigoReserva];

    connection.query(queryReserva, valuesReserva, (err) => {
        if (err) {
            console.error('Error al actualizar la reserva:', err);
            return res.status(500).json({ message: 'Error al actualizar la reserva' });
        }

        // Eliminar los acompañantes existentes para esta reserva
        const queryEliminarAcompanantes = `DELETE FROM huesped_reserva WHERE codigoReserva = ?`;
        connection.query(queryEliminarAcompanantes, [codigoReserva], (err) => {
            if (err) {
                console.error('Error al eliminar acompañantes:', err);
                return res.status(500).json({ message: 'Error al actualizar los acompañantes' });
            }

            // Insertar los nuevos acompañantes
            if (acompanantes && acompanantes.length > 0) {
                const queryInsertarAcompanantes = `
                    INSERT INTO huesped_reserva (codigoReserva, idHuesped) VALUES ?
                `;
                const valuesAcompanantes = acompanantes.map(acompanante => [codigoReserva, acompanante.documento]);
            
                connection.query(queryInsertarAcompanantes, [valuesAcompanantes], (err) => {
                    if (err) {
                        console.error('Error al insertar acompañantes:', err);
                        return res.status(500).json({ message: 'Error al actualizar los acompañantes' });
                    }
            
                    // Manejar el minibar si es necesario
                    if (minibar) {
                        const queryMinibar = `
                            INSERT INTO detalle_reserva (codigoReserva, minibarConsumido, cantidadConsumida, descripcionConsumo)
                            VALUES (?, ?, ?, ?)
                        `;
                        const valuesMinibar = [codigoReserva, true, minibar.cantidad, minibar.producto];
            
                        connection.query(queryMinibar, valuesMinibar, (err) => {
                            if (err) {
                                console.error('Error al insertar datos del minibar:', err);
                                return res.status(500).json({ message: 'Error al actualizar el minibar' });
                            }
                            res.json({ message: 'Reserva actualizada con acompañantes y minibar' });
                        });
                    } else {
                        res.json({ message: 'Reserva actualizada con acompañantes' });
                    }
                });
            } else {
                res.json({ message: 'Reserva actualizada sin acompañantes' });
            }
        });
    });
});

app.post('/api/reserva/:codigoReserva/acompanantes', (req, res) => {
    const { acompanantes } = req.body; // Lista de acompañantes con sus IDs

    if (!Array.isArray(acompanantes) || acompanantes.length === 0) {
        return res.status(400).json({ message: '⚠️ Debes enviar al menos un acompañante' });
    }

    const query = `
        INSERT INTO huesped_reserva (codigoReserva, idHuesped) 
        VALUES ?`;
    const values = acompanantes.map(idHuesped => [codigoReserva, idHuesped]);

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error('Error al agregar acompañantes:', err);
            return res.status(500).json({ message: 'Error al agregar acompañantes' });
        }
        res.json({ message: 'Acompañantes agregados correctamente', results });
    });
});

// Ruta para eliminar una reserva
app.delete('/api/reserva/:codigoReserva', (req, res) => {
    const { codigoReserva } = req.params;

    // Consulta para eliminar la reserva
    const queryEliminarReserva = `DELETE FROM hoteleria.reserva WHERE codigoReserva = ?`;

    // Consulta para eliminar los acompañantes relacionados con la reserva
    const queryEliminarAcompanantes = `DELETE FROM hoteleria.huesped_reserva WHERE codigoReserva = ?`;

    // Consulta para actualizar el estado de la habitación
    const queryActualizarHabitacion = `UPDATE hoteleria.habitacion SET ocupada = 0 WHERE numeroHabitacion = (
        SELECT numeroHabitacion FROM hoteleria.reserva WHERE codigoReserva = ?
    )`;

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).json({ message: 'Error al iniciar la transacción' });
        }

        // Eliminar los acompañantes relacionados con la reserva
        connection.query(queryEliminarAcompanantes, [codigoReserva], (err) => {
            if (err) {
                console.error('Error al eliminar acompañantes:', err);
                return connection.rollback(() => {
                    res.status(500).json({ message: 'Error al eliminar los acompañantes' });
                });
            }

            // Actualizar el estado de la habitación
            connection.query(queryActualizarHabitacion, [codigoReserva], (err) => {
                if (err) {
                    console.error('Error al actualizar el estado de la habitación:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ message: 'Error al actualizar el estado de la habitación' });
                    });
                }

                // Eliminar la reserva
                connection.query(queryEliminarReserva, [codigoReserva], (err, results) => {
                    if (err) {
                        console.error('Error al eliminar la reserva:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error al eliminar la reserva' });
                        });
                    }

                    if (results.affectedRows === 0) {
                        return connection.rollback(() => {
                            res.status(404).json({ message: 'Reserva no encontrada' });
                        });
                    }

                    // Confirmar la transacción
                    connection.commit(err => {
                        if (err) {
                            console.error('Error al confirmar la transacción:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ message: 'Error al confirmar la transacción' });
                            });
                        }

                        res.json({ message: 'Reserva eliminada correctamente' });
                    });
                });
            });
        });
    });
});

// Ruta para obtener los datos de los aprendices
app.get('/api/aprendices', (req, res) => {
    const query = `
        SELECT 
            id AS documento, 
            nombreCompleto, 
            DATE_FORMAT(fechaHoraIngreso, '%Y-%m-%d %H:%i:%s') AS fechaHoraIngreso 
        FROM aprendiz
        ORDER BY fechaHoraIngreso DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los aprendices:', err);
            return res.status(500).json({ message: 'Error al obtener los aprendices' });
        }
        res.json(results);
    });
});

// Ruta para obtener productos del minibar con asignaciones
app.get('/api/productos_minibar_con_asignaciones', (req, res) => {
    const query = `
        SELECT 
            pm.id, 
            pm.nombre, 
            pm.referencia, 
            pm.precio, 
            pm.cantidad, 
            IFNULL(SUM(ap.cantidad), 0) AS totalAsignado,
            (pm.cantidad - IFNULL(SUM(ap.cantidad), 0)) AS disponible,
            GROUP_CONCAT(CONCAT(ap.numeroHabitacion, ':', ap.cantidad) SEPARATOR ', ') AS asignaciones
        FROM producto_minibar pm
        LEFT JOIN asignacion_producto ap ON pm.id = ap.productoId
        GROUP BY pm.id
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener productos del minibar con asignaciones:", err);
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                console.log("Detalles del error (depuración):", {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: "Error al obtener productos con asignaciones",
                error: err.message 
            });
        }
        res.json({
            success: true, 
            products: results
        });
    });
});


app.get('/api/productos_minibar', (req, res) => {
    const { referencia, nombre } = req.query;

    let query = `
        SELECT 
            pm.id, 
            pm.nombre, 
            pm.referencia, 
            pm.precio, 
            pm.cantidad, 
            COALESCE(SUM(ap.cantidad), 0) AS totalAsignado,
            (pm.cantidad - COALESCE(SUM(ap.cantidad), 0)) AS disponible,
            IFNULL(GROUP_CONCAT(CONCAT(ap.numeroHabitacion, ':', ap.cantidad) SEPARATOR ', '), 'Ninguna') AS asignaciones
        FROM producto_minibar pm
        LEFT JOIN asignacion_producto ap ON pm.id = ap.productoId
    `;
    let params = [];
    let conditions = [];

    // Filtrar por referencia si se proporciona y no es "todos"
    if (referencia && referencia.toLowerCase() !== 'todos') {
        conditions.push(`LOWER(pm.referencia) = ?`);
        params.push(referencia.toLowerCase());
    }

    // Filtrar por nombre si se proporciona
    if (nombre) {
        conditions.push(`LOWER(pm.nombre) LIKE ?`);
        params.push(`%${nombre.toLowerCase()}%`);
    }

    // Si hay condiciones, agregarlas a la consulta
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY pm.id, pm.nombre, pm.referencia, pm.precio, pm.cantidad`;

    console.log("Consulta SQL:", query); // Depurar la consulta
    console.log("Parámetros:", params); // Depurar los parámetros

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Error al buscar productos del minibar:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al buscar productos",
                error: err.message 
            });
        }

        // Ajustar los valores nulos de asignaciones y calcular correctamente los disponibles
        results.forEach(product => {
            product.asignaciones = product.asignaciones || 'Ninguna';
            product.disponible = Math.max(0, product.disponible); // Asegurar que no sea negativo
        });

        res.json({
            success: true, 
            products: results
        });
    });
});

app.post('/api/productos', (req, res) => {
    const { nombre, referencia, precio, cantidad } = req.body;

    if (!nombre || !referencia || !precio || !cantidad) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const query = `
        INSERT INTO producto_minibar (nombre, referencia, precio, cantidad)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [nombre, referencia, precio, cantidad], (err, results) => {
        if (err) {
            console.error('Error al agregar el producto:', err);
            return res.status(500).json({ success: false, message: 'Error al agregar el producto.' });
        }
        res.json({ success: true, message: 'Producto agregado exitosamente.' });
    });
});

// Ruta para agregar productos al minibar
app.post('/api/productos_minibar', (req, res) => {
    const { nombre, referencia, precio, cantidad } = req.body;

    if (!nombre || !referencia || !precio || !cantidad) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const query = `
        INSERT INTO producto_minibar (nombre, referencia, precio, cantidad)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [nombre, referencia, precio, cantidad], (err, results) => {
        if (err) {
            console.error('Error al agregar el producto:', err);
            if (err.code === 'ER_BAD_FIELD_ERROR') {
                console.error('Detalles del error:', {
                    code: err.code,
                    errno: err.errno,
                    sqlState: err.sqlState,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: 'Error al agregar el producto. Verifica los datos ingresados.',
                error: err.message 
            });
        }
        res.json({ success: true, message: 'Producto agregado exitosamente.', productId: results.insertId });
    });
});

app.get('/api/productos', (req, res) => {
    const query = `
        SELECT 
            id, 
            nombre, 
            referencia, 
            precio, 
            cantidad 
        FROM producto_minibar
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            return res.status(500).json({ message: 'Error al obtener los productos' });
        }
        res.json(results);
    });
});

app.get('/api/productos/:id', (req, res) => {
    const productId = req.params.id;

    const query = `
        SELECT 
            id, 
            nombre, 
            referencia, 
            precio, 
            cantidad 
        FROM producto_minibar
        WHERE id = ?
    `;

    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            return res.status(500).json({ message: 'Error al obtener el producto' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(results[0]);
    });
});

app.put('/api/productos/:id', (req, res) => {
    const productId = req.params.id;
    const { nombre, referencia, precio, cantidad } = req.body;

    const query = `
        UPDATE producto_minibar 
        SET nombre = ?, referencia = ?, precio = ?, cantidad = ?
        WHERE id = ?
    `;

    connection.query(query, [nombre, referencia, precio, cantidad, productId], (err, results) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar el producto.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        res.json({ success: true, message: 'Producto actualizado exitosamente.' });
    });
});

app.post('/api/asignar_producto', (req, res) => {
    const { productoId, habitacion, cantidad } = req.body;

    if (!productoId || !habitacion || !cantidad || cantidad <= 0) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.' });
    }

    const queryAsignar = `
        INSERT INTO asignacion_producto (productoId, numeroHabitacion, cantidad)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
    `;

    const queryActualizarDisponible = `
        UPDATE producto_minibar
        SET cantidad = cantidad - ?
        WHERE id = ? AND cantidad >= ?
    `;

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).json({ success: false, message: 'Error al iniciar la transacción.' });
        }

        // Insertar o actualizar la asignación
        connection.query(queryAsignar, [productoId, habitacion, cantidad], (err) => {
            if (err) {
                console.error('Error al asignar el producto:', err);
                return connection.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error al asignar el producto.' });
                });
            }

            // Actualizar el disponible
            connection.query(queryActualizarDisponible, [cantidad, productoId, cantidad], (err, results) => {
                if (err || results.affectedRows === 0) {
                    console.error('Error al actualizar el disponible:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ success: false, message: 'Error al actualizar el disponible o cantidad insuficiente.' });
                    });
                }

                // Confirmar la transacción
                connection.commit(err => {
                    if (err) {
                        console.error('Error al confirmar la transacción:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error al confirmar la transacción.' });
                        });
                    }

                    res.json({ success: true, message: 'Producto asignado y disponible actualizado correctamente.' });
                });
            });
        });
    });
});

app.post('/api/desasignar_producto', (req, res) => {
    const { productoId, habitacion, cantidad } = req.body;

    if (!productoId || !habitacion || !cantidad || cantidad <= 0) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.' });
    }

    const queryDesasignar = `
        UPDATE asignacion_producto
        SET cantidad = cantidad - ?
        WHERE productoId = ? AND numeroHabitacion = ? AND cantidad >= ?
    `;

    const queryActualizarDisponible = `
        UPDATE producto_minibar
        SET cantidad = cantidad + ?
        WHERE id = ?
    `;

    const queryEliminarAsignacion = `
        DELETE FROM asignacion_producto
        WHERE productoId = ? AND numeroHabitacion = ? AND cantidad <= 0
    `;

    connection.beginTransaction(err => {
        if (err) {
            console.error('Error al iniciar la transacción:', err);
            return res.status(500).json({ success: false, message: 'Error al iniciar la transacción.' });
        }

        // Actualizar la asignación
        connection.query(queryDesasignar, [cantidad, productoId, habitacion, cantidad], (err, results) => {
            if (err || results.affectedRows === 0) {
                console.error('Error al desasignar el producto:', err);
                return connection.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error al desasignar el producto o cantidad insuficiente.' });
                });
            }

            // Actualizar el disponible
            connection.query(queryActualizarDisponible, [cantidad, productoId], (err) => {
                if (err) {
                    console.error('Error al actualizar el disponible:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ success: false, message: 'Error al actualizar el disponible.' });
                    });
                }

                // Eliminar asignaciones con cantidad <= 0
                connection.query(queryEliminarAsignacion, [productoId, habitacion], (err) => {
                    if (err) {
                        console.error('Error al eliminar asignaciones vacías:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error al limpiar asignaciones vacías.' });
                        });
                    }

                    // Confirmar la transacción
                    connection.commit(err => {
                        if (err) {
                            console.error('Error al confirmar la transacción:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ success: false, message: 'Error al confirmar la transacción.' });
                            });
                        }

                        res.json({ success: true, message: 'Producto desasignado y disponible actualizado correctamente.' });
                    });
                });
            });
        });
    });
});

app.get('/api/productos_minibar/:id/asignaciones', (req, res) => {
    const productoId = req.params.id;

    const query = `
        SELECT numeroHabitacion, cantidad
        FROM asignacion_producto
        WHERE productoId = ?
    `;

    connection.query(query, [productoId], (err, results) => {
        if (err) {
            console.error("Error al obtener asignaciones del producto:", err);
            return res.status(500).json({ success: false, message: "Error al obtener asignaciones." });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "No se encontraron asignaciones para este producto." });
        }

        res.json(results);
    });
});

app.post('/api/agregar_a_existente', (req, res) => {
    const { productId, additionalQuantity } = req.body;

    // Validar los datos recibidos
    if (!productId || !additionalQuantity || additionalQuantity <= 0) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios y la cantidad debe ser mayor a 0.' });
    }

    // Consulta para actualizar la cantidad del producto
    const query = `
        UPDATE producto_minibar
        SET cantidad = cantidad + ?
        WHERE id = ?
    `;

    connection.query(query, [additionalQuantity, productId], (err, results) => {
        if (err) {
            console.error("Error al actualizar la cantidad del producto:", err);
            return res.status(500).json({ success: false, message: 'Error al actualizar la cantidad del producto.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        res.json({ success: true, message: 'Cantidad agregada exitosamente.' });
    });
});

// Ruta para eliminar un producto
app.delete('/api/eliminar_producto', (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ success: false, message: 'El ID del producto es obligatorio.' });
    }

    const query = `DELETE FROM producto_minibar WHERE id = ?`;

    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            return res.status(500).json({ success: false, message: 'Error al eliminar el producto.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        res.json({ success: true, message: 'Producto eliminado exitosamente.' });
    });
});

app.get('/api/habitacion/:numeroHabitacion/minibar', (req, res) => {
    const { numeroHabitacion } = req.params;

    const query = `
        SELECT 
            p.id AS productoId,
            p.nombre AS producto,
            p.referencia,
            p.precio,
            ap.cantidad AS cantidadAsignada
        FROM 
            asignacion_producto ap
        JOIN 
            producto_minibar p ON ap.productoId = p.id
        WHERE 
            ap.numeroHabitacion = ?;
    `;

    connection.query(query, [numeroHabitacion], (err, results) => {
        if (err) {
            console.error('Error al obtener los productos del minibar:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener los productos del minibar.' });
        }

        res.json({ success: true, productos: results });
    });
});

app.post('/api/reserva/:codigoReserva/minibar', (req, res) => {
    const { codigoReserva } = req.params;
    const { productos } = req.body; // Array de productos consumidos

    if (!productos || productos.length === 0) {
        return res.status(400).json({ success: false, message: 'No se proporcionaron productos consumidos.' });
    }

    const query = `
        INSERT INTO detalle_reserva (codigoReserva, productoId, minibarConsumido, cantidadConsumida)
        VALUES ?
        ON DUPLICATE KEY UPDATE minibarConsumido = VALUES(minibarConsumido), cantidadConsumida = VALUES(cantidadConsumida);
    `;

    const values = productos.map(producto => [
        codigoReserva,
        producto.productoId,
        true, // minibarConsumido
        producto.cantidadConsumida
    ]);

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error('Error al guardar los productos consumidos del minibar:', err);
            return res.status(500).json({ success: false, message: 'Error al guardar los productos consumidos del minibar.' });
        }

        res.json({ success: true, message: 'Productos consumidos del minibar guardados correctamente.' });
    });
});

app.get('/api/reserva/:codigoReserva/minibar', (req, res) => {
    const { codigoReserva } = req.params;

    const query = `
        SELECT 
            pm.id AS productoId,
            pm.nombre AS producto,
            pm.precio,
            ap.cantidad AS cantidadAsignada,
            dr.cantidadConsumida
        FROM 
            producto_minibar pm
        LEFT JOIN 
            asignacion_producto ap ON pm.id = ap.productoId
        LEFT JOIN 
            detalle_reserva dr ON pm.id = dr.productoId AND dr.codigoReserva = ?
        WHERE 
            ap.numeroHabitacion = (SELECT numeroHabitacion FROM reserva WHERE codigoReserva = ?);
    `;

    connection.query(query, [codigoReserva, codigoReserva], (err, results) => {
        if (err) {
            console.error('Error al obtener los productos del minibar:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener los productos del minibar.' });
        }

        res.json({ success: true, productos: results });
    });
});

/////Fin de crud
// Ejecutar cada 24 horas para actualizar ocupaciones no le entendi la pregunta pe 
setInterval(liberarHabitaciones, 24 * 60 * 60 * 1000); 

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});