document.addEventListener('DOMContentLoaded', function () {
    var modeSwitch = document.querySelector('.mode-switch');
    var isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        modeSwitch.classList.add('active');
    }

    modeSwitch.addEventListener('click', function () {
        document.documentElement.classList.toggle('dark');
        modeSwitch.classList.toggle('active');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
    });

    var listView = document.querySelector('.list-view');
    var gridView = document.querySelector('.grid-view');
    var projectsList = document.querySelector('.project-boxes');
    listView.addEventListener('click', function () {
        gridView.classList.remove('active');
        listView.classList.add('active');
        projectsList.classList.remove('jsGridView');
        projectsList.classList.add('jsListView');
    });
    gridView.addEventListener('click', function () {
        gridView.classList.add('active');
        listView.classList.remove('active');
        projectsList.classList.remove('jsListView');
        projectsList.classList.add('jsGridView');
    });
    document.querySelector('.messages-btn').addEventListener('click', function () {
        document.querySelector('.messages-section').classList.add('show');
    });
    document.querySelector('.messages-close').addEventListener('click', function () {
        document.querySelector('.messages-section').classList.remove('show');
    });

    // Actualizar cuadros de información
    document.getElementById('novedades').textContent = 'No hay novedades.';
    document.getElementById('habitaciones-ocupadas').textContent = 'No hay habitaciones ocupadas.';
    document.getElementById('huespedes-actuales').textContent = 'No hay huéspedes en el hotel actualmente.';

    // Establecer la fecha de ingreso al valor actual
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-ingreso').value = today;

    // Toggle logout option
    var profileBtn = document.querySelector('.profile-btn');
    var logoutOption = document.querySelector('.logout-option');
    profileBtn.addEventListener('click', function () {
        logoutOption.classList.toggle('show');
        if (document.documentElement.classList.contains('dark')) {
            logoutOption.style.backgroundColor = 'black';
            logoutOption.style.color = 'white';
        } else {
            logoutOption.style.backgroundColor = 'white';
            logoutOption.style.color = 'black';
        }
    });

    // Obtener el modal
    var modal = document.getElementById("mensajeModal");

    // Obtener el botón que abre el modal
    var btn = document.getElementById("reservas-btn");

    // Obtener el elemento <span> que cierra el modal
    var span = document.getElementsByClassName("close")[0];

    // Cuando el usuario hace clic en el botón, abre el modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Cuando el usuario hace clic en <span> (x), cierra el modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Cuando el usuario hace clic en cualquier lugar fuera del modal, lo cierra
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }


    window.addEventListener('click', function(event) {
        if (!event.target.matches('.profile-btn') && !event.target.matches('.profile-btn *')) {
            var dropdowns = document.getElementsByClassName("profile-container");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });

    // Obtener el botón de perfil y la lista desplegable
    var profileBtn = document.getElementById("profile-btn");
    var profileDropdown = document.getElementById("profile-dropdown");

    // Mostrar/ocultar la lista desplegable al hacer clic en el botón de perfil
    profileBtn.onclick = function() {
        profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
    }

    // Cerrar la lista desplegable si el usuario hace clic fuera de ella
    window.onclick = function(event) {
        if (!event.target.matches('.profile-btn') && !event.target.closest('.profile-container')) {
            profileDropdown.style.display = "none";
        }
    }

    // Alternar entre modo oscuro y claro
    document.querySelector('.mode-switch').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
    });
});

function imprimirAbono(numeroHabitacion, idHuesped, abono, codigoReserva) {
    if (abono) {
        fetch(`/api/reserva/${codigoReserva}/minibar`)
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta de la API del minibar:', data);
                var ventanaImpresion = window.open('', '', 'height=600,width=800');
                ventanaImpresion.document.write('<html><head><title>Imprimir Abono</title>');
                ventanaImpresion.document.write('</head><body>');
                ventanaImpresion.document.write('<h1>SENA DREAM - Comprobante de Abono</h1>');
                ventanaImpresion.document.write('<p><strong>Número de Habitación:</strong> ' + numeroHabitacion + '</p>');
                ventanaImpresion.document.write('<p><strong>ID Huésped:</strong> ' + idHuesped + '</p>');
                ventanaImpresion.document.write('<p><strong>Cantidad del Abono:</strong> ' + abono + '</p>');

                if (data.success && Array.isArray(data.productos) && data.productos.length > 0) {
                    data.productos.forEach(producto => {
                        ventanaImpresion.document.write('<li>' + producto.producto + ' - Cantidad: ' + producto.cantidadConsumida + ' - Precio Unitario: $' + producto.precio + '</li>');
                    });
                    ventanaImpresion.document.write('</ul>');
                } else {
                    ventanaImpresion.document.write('<p>No se registraron consumos del minibar.</p>');
                }

                ventanaImpresion.document.write('<p>Firma: _______________________</p>');
                ventanaImpresion.document.write('<p><small>Este documento sirve como comprobante oficial de abono.</small></p>');
                const fechaImpresion = new Date().toLocaleString('es-ES');
                ventanaImpresion.document.write('<p><small>Fecha de impresión: ' + fechaImpresion + '</small></p>');
                ventanaImpresion.document.close();
                ventanaImpresion.print();
            })
            .catch(error => {
                console.error('Error al obtener los productos del minibar:', error);
                alert('Error al obtener los datos del minibar. Por favor, inténtalo de nuevo.');
            });
    } else {
        alert('Debes ingresar un abono para poder imprimir.');
    }
}

function descargarAbono(numeroHabitacion, idHuesped, fechaIngreso, fechaSalida, abono, diasHospedado, cantidadAcompanantes, documentosAcompanantes, codigoReserva, tipoPersona) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar el estilo del documento
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(40);

    // Agregar título
    doc.text('SENA DREAM - Comprobante de Abono', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Agregar línea decorativa
    doc.setLineWidth(0.5);
    doc.line(20, 25, doc.internal.pageSize.width - 20, 25);

    // Configurar fuente para el contenido
    doc.setFontSize(12);

    // Llamada a la API para obtener los datos de la reserva
    fetch(`/api/reserva/${codigoReserva}`)
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Reserva no encontrada') {
                alert('La reserva no existe. Por favor, verifica el código de reserva.');
                return;
            }

            console.log('Datos de la reserva:', data);

            // Actualizar valores con los datos obtenidos de la API
            tipoPersona = data.tipoPersona || tipoPersona; // Si no se pasa tipoPersona, usar el valor de la API
            numeroHabitacion = data.numeroHabitacion || numeroHabitacion;
            idHuesped = data.idHuesped || idHuesped;
            fechaIngreso = new Date(data.fechaIngreso).toLocaleDateString('es-ES') || fechaIngreso;
            fechaSalida = new Date(data.fechaSalida).toLocaleDateString('es-ES') || fechaSalida;
            abono = `$ ${data.abono || 0}`;

            // Agregar información de la reserva
            const contenido = [
                `Número de Habitación: ${numeroHabitacion}`,
                `ID Huésped: ${idHuesped}`,
                `Tipo de Persona: ${tipoPersona}`,
                `Fecha de Ingreso: ${fechaIngreso}`,
                `Fecha de Salida: ${fechaSalida}`,
                `Abono: ${abono}`,
                `Días Hospedado: ${diasHospedado}`,
                `Cantidad de Acompañantes: ${cantidadAcompanantes}`,
                `Documentos de Acompañantes: ${documentosAcompanantes}`
            ];

            let yPos = 40;
            contenido.forEach(linea => {
                doc.text(linea, 20, yPos);
                yPos += 10;
            });

            // Agregar información del minibar
            if (data.minibar && data.minibar.length > 0) {
                yPos += 10;
                doc.text('Consumo del Minibar:', 20, yPos);
                yPos += 10;

                data.minibar.forEach(producto => {
                    const linea = `${producto.producto} - Cantidad Consumida: ${producto.cantidadConsumida} - Precio Unitario: $${producto.precio}`;
                    doc.text(linea, 20, yPos);
                    yPos += 10;
                });
            } else {
                yPos += 10;
                doc.text('Consumo del Minibar: Ninguno', 20, yPos);
            }

            // Agregar línea para firma
            yPos += 20;
            doc.text('Firma: _______________________', 20, yPos);

            // Agregar nota legal
            yPos += 20;
            doc.setFontSize(10);
            doc.text('Este documento sirve como comprobante oficial de abono.', 20, yPos);

            // Agregar pie de página con fecha y hora
            doc.setFontSize(8);
            const fechaImpresion = new Date().toLocaleString('es-ES');
            doc.text(`Fecha de impresión: ${fechaImpresion}`, 20, doc.internal.pageSize.height - 10);

            // Descargar el PDF
            doc.save(`comprobante_abono_${numeroHabitacion}_${idHuesped}.pdf`);
        })
        .catch(error => {
            console.error('Error al obtener los datos de la reserva:', error);
            alert('Error al generar el comprobante de abono. Por favor, inténtalo de nuevo.');
        });
}

function descargarFactura(numeroHabitacion, idHuesped, fechaIngreso, fechaSalida, abono, diasHospedado, cantidadAcompanantes, documentosAcompanantes, codigoReserva, tipoPersona) {
    if (!codigoReserva) {
        console.error('El código de reserva es inválido:', codigoReserva);
        alert('Por favor, proporciona un código de reserva válido.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar el estilo del documento
    doc.setFont('helvetica');
    doc.setFontSize(20);
    doc.setTextColor(40);

    // Agregar título
    doc.text('SENA DREAM - Factura', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Agregar línea decorativa
    doc.setLineWidth(0.5);
    doc.line(20, 25, doc.internal.pageSize.width - 20, 25);

    // Configurar fuente para el contenido
    doc.setFontSize(12);

    // Llamada a la API para obtener los datos de la reserva
    console.log('Intentando obtener datos de la factura para el código de reserva:', codigoReserva);
    fetch(`/api/reserva/${codigoReserva}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener los datos de la reserva: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Reserva no encontrada') {
                alert('La reserva no existe. Por favor, verifica el código de reserva.');
                return;
            }

            console.log('Datos de la reserva:', data);

            // Actualizar valores con los datos obtenidos de la API
            tipoPersona = data.tipoPersona || tipoPersona;
            numeroHabitacion = data.numeroHabitacion || numeroHabitacion;
            idHuesped = data.idHuesped || idHuesped;
            fechaIngreso = new Date(data.fechaIngreso).toLocaleDateString('es-ES') || fechaIngreso;
            fechaSalida = new Date(data.fechaSalida).toLocaleDateString('es-ES') || fechaSalida;
            abono = parseFloat(data.abono || 0); // Convertir abono a número para cálculos

            // Agregar información de la reserva en formato de cuadrícula
            const datosReserva = [
                ['Número de Habitación', numeroHabitacion],
                ['ID Huésped', idHuesped],
                ['Tipo de Persona', tipoPersona],
                ['Fecha de Ingreso', fechaIngreso],
                ['Fecha de Salida', fechaSalida],
                ['Abono', `$ ${abono.toFixed(2)}`],
                ['Días Hospedado', diasHospedado],
                ['Cantidad de Acompañantes', cantidadAcompanantes],
                ['Documentos de Acompañantes', documentosAcompanantes || 'Sin acompañantes']
            ];

            let yPos = 40;
            datosReserva.forEach(([label, value]) => {
                doc.text(`${label}:`, 20, yPos);
                doc.text(`${value}`, 80, yPos); // Alinear el valor a la derecha
                yPos += 10;
            });

            // Espacio antes de los datos del minibar
            yPos += 10;

            // Agregar información del minibar
            if (data.minibar && data.minibar.length > 0) {
                doc.text('Consumo del Minibar:', 20, yPos);
                yPos += 10;

                data.minibar.forEach(producto => {
                    const linea = `${producto.producto} - Cantidad Consumida: ${producto.cantidadConsumida} - Precio Unitario: $${producto.precio}`;
                    doc.text(linea, 20, yPos);
                    yPos += 10;
                });
            } else {
                doc.text('Consumo del Minibar: Ninguno', 20, yPos);
                yPos += 10;
            }

            // Espacio antes de los cálculos
            yPos += 10;

            // Definir el costo por día según el tipo de persona
            const costoPorDia = tipoPersona === 'funcionaria' ? 80000 : 90000;

            // Calcular el costo total por días hospedados
            const costoHospedaje = diasHospedado * costoPorDia;

            // Calcular el costo adicional por acompañantes
            const costoAcompanantes = cantidadAcompanantes * diasHospedado * costoPorDia;

            // Calcular el total del minibar
            let totalMinibar = 0;
            if (data.minibar && data.minibar.length > 0) {
                totalMinibar = data.minibar.reduce((total, producto) => {
                    return total + (producto.cantidadConsumida * parseFloat(producto.precio));
                }, 0);
            }

            // Calcular el total general antes del abono
            const totalAntesDeAbono = costoHospedaje + costoAcompanantes + totalMinibar;

            // Calcular el total final después del abono
            const totalFinal = totalAntesDeAbono - abono;

            // Agregar cálculos al PDF en formato de cuadrícula
            const datosCalculos = [
                ['Costo por Día (por persona)', `$ ${costoPorDia.toFixed(2)}`],
                ['Costo Hospedaje', `$ ${costoHospedaje.toFixed(2)}`],
                ['Costo Acompañantes', `$ ${costoAcompanantes.toFixed(2)}`],
                ['Total Minibar', `$ ${totalMinibar.toFixed(2)}`],
                ['Total Antes de Abono', `$ ${totalAntesDeAbono.toFixed(2)}`],
                ['Abono', `$ ${abono.toFixed(2)}`],
                ['Total Final', `$ ${totalFinal.toFixed(2)}`]
            ];

            yPos += 10;
            datosCalculos.forEach(([label, value]) => {
                doc.text(`${label}:`, 20, yPos);
                doc.text(`${value}`, 80, yPos); // Alinear el valor a la derecha
                yPos += 10;
            });

            // Agregar línea para firma
            yPos += 20;
            doc.text('Firma: _______________________', 20, yPos);

            // Agregar nota legal
            yPos += 20;
            doc.setFontSize(10);
            doc.text('Este documento sirve como factura oficial.', 20, yPos);

            // Agregar pie de página con fecha y hora
            doc.setFontSize(8);
            const fechaImpresion = new Date().toLocaleString('es-ES');
            doc.text(`Fecha de impresión: ${fechaImpresion}`, 20, doc.internal.pageSize.height - 10);

            // Descargar el PDF
            doc.save(`factura_${numeroHabitacion}_${idHuesped}.pdf`);
        })
        .catch(error => {
            console.error('Error al obtener los datos de la reserva:', error);
            alert('Error al generar la factura. Por favor, inténtalo de nuevo.');
        });
}

