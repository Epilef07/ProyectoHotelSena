const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connection = require('./dbConnection');
const { agregarHuesped, buscarHuesped, actualizarHuesped } = require('./crudHuespedes');
const { agregarTarea, obtenerTareas, actualizarTarea, eliminarTarea } = require('./crudTareas');
const { agregarReserva, obtenerReservas } = require('./reservaciones'); // Ruta corregida

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Asegúrate de que esto esté presente

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

            if (user.rol === 'admin') {
                return res.redirect('/HTML/menu.html');
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


                    return res.redirect('/HTML/menuUser.html');
                });
            } else {
                return res.redirect('/?error=Rol desconocido');
            }
        } else {
            return res.redirect('/?error=Nombre de usuario o contraseña incorrectos');
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
    const nuevaTarea = { descripcion: req.body.descripcion };
    agregarTarea(nuevaTarea, (err, results) => {
        if (err) {
            console.error('Error al agregar la tarea:', err);
            return res.status(500).json({ success: false, message: 'Error al agregar la tarea' });
        }
        res.json({ success: true, message: 'Tarea agregada exitosamente', results });
    });
});

// Ruta para obtener todas las tareas
app.get('/api/tareas', (req, res) => {
    obtenerTareas((err, results) => {
        if (err) {
            console.error('Error al obtener las tareas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener las tareas' });
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

/////Fin de crud
// Ejecutar cada 24 horas para actualizar ocupaciones
setInterval(liberarHabitaciones, 24 * 60 * 60 * 1000); 




// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});