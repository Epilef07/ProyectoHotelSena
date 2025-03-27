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

    // Evitar que se ingresen números o caracteres especiales en el campo de nombre
    document.getElementById('nombre').addEventListener('input', function (e) {
        var value = e.target.value;
        e.target.value = value.replace(/[^A-Za-z\s]/g, '');
    });

    // Manejar el menú desplegable del perfil
    var profileBtn = document.querySelector('.profile-btn');
    var profileContainer = document.querySelector('.profile-container');

    profileBtn.addEventListener('click', function() {
        profileContainer.classList.toggle('show');
    });

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

function imprimirAbono() {
    var abono = document.getElementById('abono').value;
    if (abono) {
        var ventanaImpresion = window.open('', '', 'height=400,width=600');
        ventanaImpresion.document.write('<html><head><title>Imprimir Abono</title>');
        ventanaImpresion.document.write('</head><body>');
        ventanaImpresion.document.write('<h1>Cantidad del Abono</h1>');
        ventanaImpresion.document.write('<p>' + abono + '</p>');
        ventanaImpresion.document.write('</body></html>');
        ventanaImpresion.document.close();
        ventanaImpresion.print();
    } else {
        alert('Debes ingresar un abono para poder imprimir.');
    }
}

function descargarAbono(numeroHabitacion, idHuesped, fechaIngreso, fechaSalida, abono, diasHospedado, cantidadAcompanantes, documentosAcompanantes) {
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

    // Agregar información de la reserva
    const contenido = [
        `Número de Habitación: ${numeroHabitacion}`,
        `ID Huésped: ${idHuesped}`,
        `Fecha de Ingreso: ${fechaIngreso}`,
        `Fecha de Salida: ${fechaSalida}`,
        `Abono: ${abono}`,
        `Días Hospedado: ${diasHospedado}`,
        `Cantidad de Acompañantes: ${cantidadAcompanantes}`,
        `Documentos de Acompañantes: ${documentosAcompanantes}`
    ];

    // Agregar contenido con espaciado
    let yPos = 40;
    contenido.forEach(linea => {
        doc.text(linea, 20, yPos);
        yPos += 10;
    });

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
}

function descargarFactura(numeroHabitacion, idHuesped, fechaIngreso, fechaSalida) {
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

    // Agregar información de la factura
    const contenido = [
        `Número de Habitación: ${numeroHabitacion}`,
        `ID Huésped: ${idHuesped}`,
        `Fecha de Ingreso: ${fechaIngreso}`,
        `Fecha de Salida: ${fechaSalida}`
    ];

    // Agregar contenido con espaciado
    let yPos = 40;
    contenido.forEach(linea => {
        doc.text(linea, 20, yPos);
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
}