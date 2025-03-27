DELIMITER $$

-- Disparador para insertar un usuario cuando se inserta un nuevo aprendiz
CREATE TRIGGER after_insert_aprendiz
AFTER INSERT ON aprendiz
FOR EACH ROW
BEGIN
    INSERT INTO usuarios (
        nombreUsuario, 
        password, 
        rol, 
        idAprendiz
    ) VALUES (
        NEW.nombreCompleto, -- Usar el nombre del aprendiz recién insertado como nombre de usuario
        NEW.id, -- Usar el número de documento del aprendiz como contraseña
        'user',              -- Asignar el rol 'user' por defecto
        NEW.id               -- Usar el ID del aprendiz recién insertado
    );
END$$

DELIMITER $$

-- Disparador para insertar un usuario cuando se inserta un nuevo administrador
CREATE TRIGGER after_insert_administrador
AFTER INSERT ON administrador
FOR EACH ROW
BEGIN
    INSERT INTO usuarios (
        nombreUsuario, 
        password, 
        rol, 
        idAdministrador
    ) VALUES (
        CONCAT(NEW.nombre, ' ', NEW.apellido), -- Usar el nombre completo del administrador como nombre de usuario
        NEW.id,                               -- Usar el ID del administrador como contraseña
        'admin',                              -- Asignar el rol 'admin' por defecto
        NEW.id                                -- Usar el ID del administrador recién insertado
    );
END$$

DELIMITER ;

INSERT INTO hotel (nit,nombre,telefono,direccion) VALUES (11,"Hotel Sena",3105554320,"Carrera 27");
INSERT INTO habitacion (numeroHabitacion, nit, ocupada) VALUES (501, 11, FALSE);
INSERT INTO habitacion (numeroHabitacion, nit, ocupada) VALUES (502, 11, FALSE);
INSERT INTO habitacion (numeroHabitacion, nit, ocupada) VALUES (503, 11, FALSE);
INSERT INTO administrador(
    id, 
    nit, 
    nombre, 
    apellido, 
    fechaNacimiento, 
    telefono, 
    correoElectronico
) VALUES (
    1, 
    11, 
    'Juan', 
    'Pérez', 
    '1990-01-01', 
    987654321, 
    'juan@example.com'
);
INSERT INTO aprendiz (
    id, 
    idAdministrador, 
    tipoDocumento, 
    numeroFicha, 
    nombreCompleto, 
    telefono, 
    correoElectronico, 
    fechaHoraIngreso
) VALUES (
    1, 
    1, 
    'CC', 
    123456, 
    'Carlos Gómez', 
    555555555, 
    'carlos@example.com', 
    NOW()
);

SELECT * FROM usuarios;
