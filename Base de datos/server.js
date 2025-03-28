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


app.get('/api/habitaciones', (_, res) => {
    const query = `SELECT numeroHabitacion, ocupada FROM hoteleria.habitacion`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener habitaciones:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener habitaciones' });
        }
        res.json(results);
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
            MAX(dr.descripcionConsumo) AS descripcionConsumo,
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

    const queryAcompanantes = `
        SELECT idHuesped AS documento
        FROM huesped_reserva
        WHERE codigoReserva = ?
    `;

    connection.query(queryReserva, [codigoReserva], (err, reservaResults) => {
        if (err) {
            console.error('Error al obtener la reserva:', err);
            return res.status(500).json({ message: 'Error al obtener la reserva' });
        }

        if (reservaResults.length === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Obtener los acompañantes relacionados con la reserva
        connection.query(queryAcompanantes, [codigoReserva], (err, acompanantesResults) => {
            if (err) {
                console.error('Error al obtener los acompañantes:', err);
                return res.status(500).json({ message: 'Error al obtener los acompañantes' });
            }

            // Combinar los datos de la reserva con los acompañantes
            const reserva = reservaResults[0];
            reserva.acompanantes = acompanantesResults;

            res.json(reserva);
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
    const { codigoReserva } = req.params;
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

// Ruta para agregar productos del minibar
app.post('/api/productos_minibar', (req, res) => {
    const { nombre, referencia, precio, cantidad } = req.body;

    const query = `
        INSERT INTO producto_minibar (nombre, referencia, precio, cantidad)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(query, [nombre, referencia, precio, cantidad], (err, results) => {
        if (err) {
            console.error('Error al agregar el producto:', err);
            return res.status(500).json({ success: false, message: 'Error al agregar el producto' });
        }
        res.json({ success: true, message: 'Producto agregado exitosamente' });
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
            pm.imagen, 
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
            return res.status(500).json({ 
                success: false, 
                message: "Error al obtener productos con asignaciones",
                error: err.message 
            });
        }

        // Ajustar valores nulos para asignaciones
        results.forEach(product => {
            product.asignaciones = product.asignaciones || 'Ninguna';
        });

        res.json({
            success: true, 
            products: results
        });
    });
});

// Ruta para buscar productos del minibar con filtros y asignaciones
app.get('/api/productos_minibar', (req, res) => {
    const { referencia, nombre } = req.query;

    let query = `
        SELECT 
            pm.id, 
            pm.nombre, 
            pm.referencia, 
            pm.precio, 
            pm.imagen, 
            pm.cantidad, 
            COALESCE(SUM(ap.cantidad), 0) AS totalAsignado,
            (pm.cantidad - COALESCE(SUM(ap.cantidad), 0)) AS disponible,
            IFNULL(GROUP_CONCAT(CONCAT(ap.numeroHabitacion, ':', ap.cantidad) SEPARATOR ', '), 'Ninguna') AS asignaciones
        FROM producto_minibar pm
        LEFT JOIN asignacion_producto ap ON pm.id = ap.productoId
    `;
    
    let params = [];
    let conditions = [];

    // Si referencia no es "todos", aplicamos el filtro
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

    query += ` GROUP BY pm.id, pm.nombre, pm.referencia, pm.precio, pm.imagen, pm.cantidad`;

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

// Ruta para obtener habitaciones
app.get('/api/habitaciones', (req, res) => {
    const query = 'SELECT numeroHabitacion FROM habitacion WHERE ocupada = FALSE';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener habitaciones:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener habitaciones' });
        }
        res.json({ success: true, habitaciones: results });
    });
});

// Ruta para asignar productos a habitaciones
app.post('/api/asignar_producto', (req, res) => {
    const { productoId, habitacion, cantidad } = req.body;

    // Convertir la cantidad a entero para evitar errores de comparación
    const cantidadSolicitada = parseInt(cantidad, 10);

    // Verificar la cantidad total disponible en el minibar
    const queryProducto = 'SELECT cantidad FROM producto_minibar WHERE id = ?';
    connection.query(queryProducto, [productoId], (err, results) => {
        if (err) {
            console.error('Error al obtener la cantidad del producto:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener la cantidad del producto', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const cantidadDisponible = results[0].cantidad;

        // Obtener la cantidad ya asignada del producto en todas las habitaciones
        const queryAsignacion = `
            SELECT IFNULL(SUM(cantidad), 0) AS cantidadAsignada 
            FROM asignacion_producto 
            WHERE productoId = ?
        `;
        connection.query(queryAsignacion, [productoId], (err, results) => {
            if (err) {
                console.error('Error al obtener la cantidad asignada:', err);
                return res.status(500).json({ success: false, message: 'Error al obtener la cantidad asignada', error: err.message });
            }

            const cantidadAsignada = results[0].cantidadAsignada || 0;
            const cantidadRestante = cantidadDisponible - cantidadAsignada;

            console.log(`Cantidad disponible: ${cantidadDisponible}`);
            console.log(`Cantidad ya asignada: ${cantidadAsignada}`);
            console.log(`Cantidad restante: ${cantidadRestante}`);
            console.log(`Cantidad solicitada: ${cantidadSolicitada}`);

            if (cantidadSolicitada > cantidadRestante) {
                return res.status(400).json({ 
                    success: false, 
                    message: `No puedes asignar más productos de los que hay disponibles. Cantidad restante: ${cantidadRestante}`
                });
            }

            // Insertar o actualizar la asignación en la tabla asignacion_producto
            const queryInsert = `
                INSERT INTO asignacion_producto (productoId, numeroHabitacion, cantidad) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
            `;

            connection.query(queryInsert, [productoId, habitacion, cantidadSolicitada], (err, results) => {
                if (err) {
                    console.error('Error al asignar producto:', err);
                    return res.status(500).json({ success: false, message: 'Error al asignar producto', error: err.message });
                }
                res.json({ success: true, message: 'Producto asignado correctamente' });
            });
        });
    });
});

// Ruta para desasignar productos de habitaciones
app.post('/api/desasignar_producto', (req, res) => {
    const { productoId, habitacion, cantidad } = req.body;

    // Convertir la cantidad a entero para evitar errores de comparación
    const cantidadDesasignada = parseInt(cantidad, 10);

    if (!productoId || !habitacion || isNaN(cantidadDesasignada) || cantidadDesasignada <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Datos inválidos. Asegúrate de proporcionar productoId, habitacion y una cantidad válida.' 
        });
    }

    // Verificar si existe una asignación para el producto y la habitación
    const queryAsignacion = `
        SELECT cantidad 
        FROM asignacion_producto 
        WHERE productoId = ? AND numeroHabitacion = ?
    `;

    connection.query(queryAsignacion, [productoId, habitacion], (err, results) => {
        if (err) {
            console.error('Error al verificar la asignación:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar la asignación', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No se encontró una asignación para este producto y habitación' });
        }

        const cantidadAsignada = results[0].cantidad;

        if (cantidadDesasignada > cantidadAsignada) {
            return res.status(400).json({ 
                success: false, 
                message: `No puedes desasignar más productos de los que están asignados. Cantidad asignada: ${cantidadAsignada}` 
            });
        }

        // Iniciar una transacción para asegurar consistencia
        connection.beginTransaction(err => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                return res.status(500).json({ success: false, message: 'Error al iniciar la transacción', error: err.message });
            }

            // Restar la cantidad desasignada de la asignación existente
            const queryUpdateAsignacion = `
                UPDATE asignacion_producto 
                SET cantidad = cantidad - ? 
                WHERE productoId = ? AND numeroHabitacion = ?
            `;

            connection.query(queryUpdateAsignacion, [cantidadDesasignada, productoId, habitacion], (err) => {
                if (err) {
                    console.error('Error al actualizar la asignación:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ success: false, message: 'Error al actualizar la asignación', error: err.message });
                    });
                }

                // Eliminar la asignación si la cantidad llega a 0
                const queryDeleteAsignacion = `
                    DELETE FROM asignacion_producto 
                    WHERE productoId = ? AND numeroHabitacion = ? AND cantidad = 0
                `;

                connection.query(queryDeleteAsignacion, [productoId, habitacion], (err) => {
                    if (err) {
                        console.error('Error al eliminar la asignación:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error al eliminar la asignación', error: err.message });
                        });
                    }

                    // Sumar la cantidad desasignada al disponible en el minibar
                    const queryUpdateProducto = `
                        UPDATE producto_minibar 
                        SET cantidad = cantidad + ? 
                        WHERE id = ?
                    `;

                    connection.query(queryUpdateProducto, [cantidadDesasignada, productoId], (err) => {
                        if (err) {
                            console.error('Error al actualizar el producto:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ success: false, message: 'Error al actualizar el producto', error: err.message });
                            });
                        }

                        // Confirmar la transacción
                        connection.commit(err => {
                            if (err) {
                                console.error('Error al confirmar la transacción:', err);
                                return connection.rollback(() => {
                                    res.status(500).json({ success: false, message: 'Error al confirmar la transacción', error: err.message });
                                });
                            }

                            console.log(`Producto desasignado correctamente: Producto ID ${productoId}, Habitación ${habitacion}, Cantidad ${cantidadDesasignada}`);
                            res.json({ success: true, message: 'Producto desasignado correctamente' });
                        });
                    });
                });
            });
        });
    });
});

// Ruta para obtener productos asignados por habitación
app.get('/api/productos_por_habitacion', (req, res) => {
    const query = `
        SELECT h.numeroHabitacion, pm.nombre, ap.cantidad
        FROM habitacion h
        LEFT JOIN asignacion_producto ap ON h.numeroHabitacion = ap.numeroHabitacion
        LEFT JOIN producto_minibar pm ON ap.productoId = pm.id
        ORDER BY h.numeroHabitacion, pm.nombre
    `;

    console.log("Ejecutando consulta para obtener productos por habitación...");

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error al ejecutar la consulta SQL:", err);
            return res.status(500).json({
                success: false,
                message: "Error al obtener productos por habitación",
                error: err.message
            });
        }

        console.log("Resultados obtenidos de la consulta:", results);

        const rooms = results.reduce((acc, row) => {
            let room = acc.find(r => r.numeroHabitacion === row.numeroHabitacion);
            if (!room) {
                room = { numeroHabitacion: row.numeroHabitacion, productos: [] };
                acc.push(room);
            }
            if (row.nombre) {
                room.productos.push({ nombre: row.nombre, cantidad: row.cantidad });
            }
            return acc;
        }, []);

        console.log("Datos procesados para las habitaciones:", rooms);

        res.json({
            success: true,
            rooms: rooms
        });
    });
});

app.get('/api/buscar_productos', (req, res) => {
    const { referencia, nombre } = req.query;

    let query = `
        SELECT 
            pm.id, 
            pm.nombre, 
            pm.referencia, 
            pm.precio, 
            pm.imagen, 
            pm.cantidad, 
            COALESCE(SUM(ap.cantidad), 0) AS totalAsignado,
            (pm.cantidad - COALESCE(SUM(ap.cantidad), 0)) AS disponible,
            IFNULL(GROUP_CONCAT(CONCAT(ap.numeroHabitacion, ':', ap.cantidad) SEPARATOR ', '), 'Ninguna') AS asignaciones
        FROM producto_minibar pm
        LEFT JOIN asignacion_producto ap ON pm.id = ap.productoId
    `;

    let params = [];
    let conditions = [];

    // Filtrar por referencia si se proporciona
    if (referencia && referencia.toLowerCase() !== 'todos') {
        conditions.push(`LOWER(pm.referencia) = ?`);
        params.push(referencia.toLowerCase());
    }

    // Filtrar por nombre si se proporciona
    if (nombre) {
        conditions.push(`LOWER(pm.nombre) LIKE ?`);
        params.push(`%${nombre.toLowerCase()}%`);
    }

    // Agregar condiciones a la consulta si existen
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY pm.id, pm.nombre, pm.referencia, pm.precio, pm.imagen, pm.cantidad`;

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

/////Fin de crud
// Ejecutar cada 24 horas para actualizar ocupaciones
setInterval(liberarHabitaciones, 24 * 60 * 60 * 1000); 

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});