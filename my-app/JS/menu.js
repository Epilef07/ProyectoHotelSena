document.addEventListener('DOMContentLoaded', function () {
    var modeSwitch = document.querySelector('.mode-switch');
    var isDarkMode = localStorage.getItem('darkMode') === 'true';
    var listView = document.querySelector('.list-view');
    var gridView = document.querySelector('.grid-view');
    var projectsList = document.querySelector('.project-boxes');
    var isListView = localStorage.getItem('listView') === 'true';

    if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.classList.remove('light-mode');
        modeSwitch.classList.add('active');
    } else {
        document.documentElement.classList.add('light-mode');
        document.documentElement.classList.remove('dark-mode');
    }

    if (isListView) {
        console.log(isListView); 
        gridView.classList.remove('active');
        listView.classList.add('active');
        projectsList.classList.remove('jsGridView');
        projectsList.classList.add('jsListView');
    }
 // borre 
    modeSwitch.addEventListener('click', function () {
        document.documentElement.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('light-mode');
        modeSwitch.classList.toggle('active');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
    });
    listView.addEventListener('click', function () {
        gridView.classList.remove('active');
        listView.classList.add('active');
        projectsList.classList.remove('jsGridView');
        projectsList.classList.add('jsListView');
        localStorage.setItem('listView', true);
    });

    gridView.addEventListener('click', function () { 
        gridView.classList.add('active');
        listView.classList.remove('active');
        projectsList.classList.remove('jsListView');
        projectsList.classList.add('jsGridView');
        localStorage.setItem('listView', false);
    });

    // borre av

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
        if (document.documentElement.classList.contains('dark-mode')) {
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
        document.documentElement.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
    });
});