document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
        console.error('⚠️ No se encontró el elemento con ID "calendario1". Verifica el HTML.');
        return;
    }

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('/api/calendario')
                .then(response => {
                    if (!response.ok) throw new Error('Error en la respuesta de la API');
                    return response.json();
                })
                .then(data => {
                    console.log('✅ Datos recibidos:', data);

                    if (!Array.isArray(data)) {
                        console.warn('⚠️ La API no devolvió un array. Verifica la respuesta.');
                        return successCallback([]);
                    }

                    const eventos = data.map(reserva => {
                        let fechaSalida = new Date(reserva.fechaSalida);
                        fechaSalida.setDate(fechaSalida.getDate() + 1);
                        let fechaSalidaStr = fechaSalida.toISOString().split('T')[0];

                        let colorEvento = 'green'; // Disponible
                        let hoy = new Date().toISOString().split('T')[0];

                        if (reserva.ocupada) {
                            colorEvento = 'red'; // Ocupada actualmente
                        } else if (reserva.fechaIngreso > hoy) {
                            colorEvento = 'blue'; // Reserva futura
                        }

                        return {
                            title: `Habitación ${reserva.numeroHabitacion}`,
                            start: reserva.fechaIngreso,
                            end: fechaSalidaStr,
                            color: colorEvento
                        };
                    });

                    console.log('📅 Eventos procesados:', eventos);
                    successCallback(eventos);
                })
                .catch(error => {
                    console.error('❌ Error al cargar los eventos:', error);
                    failureCallback(error);
                });
        }
    });
    calendar.render();

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

    // Desplazamiento con el teclado
    document.addEventListener('keydown', function(event) {
        console.log('Tecla presionada:', event.key);
        var appContainer = document.querySelector('.app-container');
        if (event.key === 'ArrowUp') {
            appContainer.scrollBy({
                top: -100,
                behavior: 'smooth'
            });
        } else if (event.key === 'ArrowDown') {
            appContainer.scrollBy({
                top: 100,
                behavior: 'smooth'
            });
        }
    });

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
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    });
    gridView.addEventListener('click', function () {
        gridView.classList.add('active');
        listView.classList.remove('active');
        projectsList.classList.remove('jsListView');
        projectsList.classList.add('jsGridView');
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    });

    actualizarTablaAprendices();
});

function actualizarTablaAprendices() {
    const url = '/api/aprendices'; // Ruta para obtener los datos de los aprendices

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los datos de los aprendices');
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.querySelector("#tabla-aprendices tbody");
            tbody.innerHTML = ""; // Limpiar el contenido actual de la tabla

            data.forEach(aprendiz => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${new Date(aprendiz.fechaHoraIngreso).toLocaleTimeString()}</td>
                    <td>${new Date(aprendiz.fechaHoraIngreso).toLocaleDateString()}</td>
                    <td>${aprendiz.nombreCompleto}</td>
                    <td>${aprendiz.documento}</td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error al actualizar la tabla de aprendices:", error);
        });
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', actualizarTablaAprendices);

// Actualizar la tabla automáticamente cada 30 segundos
setInterval(actualizarTablaAprendices, 30000);