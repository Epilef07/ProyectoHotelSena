CREATE DATABASE IF NOT EXISTS hoteleria;
USE hoteleria;

CREATE TABLE IF NOT EXISTS hotel(
    nit BIGINT NOT NULL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono BIGINT NOT NULL,
    direccion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS administrador(
    id BIGINT NOT NULL PRIMARY KEY,
    nit BIGINT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    telefono BIGINT NOT NULL,
    correoElectronico VARCHAR(255),
    resetToken VARCHAR(255), -- Campo para el token de restablecimiento de contraseña
    FOREIGN KEY (nit) REFERENCES hotel(nit)
);

CREATE TABLE IF NOT EXISTS aprendiz(
    id BIGINT NOT NULL PRIMARY KEY,
    idAdministrador BIGINT NOT NULL,
    tipoDocumento VARCHAR(255) NOT NULL,
    numeroFicha BIGINT NOT NULL,
    nombreCompleto VARCHAR(255) NOT NULL,
    telefono BIGINT NOT NULL,
    correoElectronico VARCHAR(255) NOT NULL,
    fechaHoraIngreso TIMESTAMP,
    resetToken VARCHAR(255), -- Campo para el token de restablecimiento de contraseña
    FOREIGN KEY (idAdministrador) REFERENCES administrador(id)
);

CREATE TABLE IF NOT EXISTS huesped(
    id BIGINT NOT NULL PRIMARY KEY,
    idAdministrador BIGINT,
    tipoDocumento VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono BIGINT NOT NULL,
    fechaNacimiento DATE NOT NULL,
    contactoEmergencia VARCHAR(255) NOT NULL,
    telefonoEmergencia BIGINT NOT NULL,
    direccion VARCHAR(255) NOT NULL, -- Nuevo campo
    ciudad VARCHAR(255) NOT NULL, -- Nuevo campo
    FOREIGN KEY(idAdministrador) REFERENCES administrador(id)
);

CREATE TABLE IF NOT EXISTS habitacion(
    numeroHabitacion SMALLINT NOT NULL PRIMARY KEY,
    nit BIGINT NOT NULL,
    ocupada BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY(nit) REFERENCES hotel(nit)
);

CREATE TABLE IF NOT EXISTS reserva(
    codigoReserva BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idAdministrador BIGINT,
    idAprendiz BIGINT,
    numeroHabitacion SMALLINT NOT NULL,
    idHuesped BIGINT NOT NULL,
    tipoPersona ENUM('funcionario', 'externa') NOT NULL,
    fechaIngreso DATE NOT NULL,
    fechaSalida DATE NOT NULL,
    cantidadAcompañante SMALLINT DEFAULT 0, 
    abono DECIMAL(10,2),
    FOREIGN KEY(idAdministrador) REFERENCES administrador(id),
    FOREIGN KEY(idAprendiz) REFERENCES aprendiz(id),
    FOREIGN KEY(numeroHabitacion) REFERENCES habitacion(numeroHabitacion),
    FOREIGN KEY(idHuesped) REFERENCES huesped(id)
);
CREATE TABLE IF NOT EXISTS detalle_reserva (
    idDetalle BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigoReserva BIGINT NOT NULL,
    minibarConsumido BOOLEAN DEFAULT FALSE,
    cantidadConsumida SMALLINT DEFAULT 0,
    FOREIGN KEY(codigoReserva) REFERENCES reserva(codigoReserva) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS huesped_reserva (
    idRelacion BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigoReserva BIGINT NOT NULL,
    idHuesped BIGINT NOT NULL,
    FOREIGN KEY(codigoReserva) REFERENCES reserva(codigoReserva) ON DELETE CASCADE,
    FOREIGN KEY(idHuesped) REFERENCES huesped(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS tareas(
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idUsuario BIGINT NOT NULL,
    descripcion VARCHAR(255),
    FOREIGN KEY (idUsuario) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'user') NOT NULL,
    idAdministrador BIGINT,
    idAprendiz BIGINT,
    FOREIGN KEY (idAdministrador) REFERENCES administrador(id),
    FOREIGN KEY (idAprendiz) REFERENCES aprendiz(id)
);

-- Tabla para almacenar los productos del minibar
CREATE TABLE IF NOT EXISTS producto_minibar (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    referencia ENUM('bebidas-energeticas', 'galletas', 'golosinas','gaseosas', 'paqueteria') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
);

CREATE TABLE IF NOT EXISTS asignacion_producto (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    productoId BIGINT NOT NULL,
    numeroHabitacion SMALLINT NOT NULL,
    cantidad INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (productoId, numeroHabitacion),
    FOREIGN KEY (productoId) REFERENCES producto_minibar(id),
    FOREIGN KEY (numeroHabitacion) REFERENCES habitacion(numeroHabitacion)
);
