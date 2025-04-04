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
    gridView.addEventListener('click', function () {
        gridView.classList.add('active');
        listView.classList.remove('active');
        projectsList.classList.remove('jsListView');
        projectsList.classList.add('jsGridView');
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
    });
    document.querySelector('.messages-btn').addEventListener('click', function () {
        document.querySelector('.messages-section').classList.add('show');
    });
    document.querySelector('.messages-close').addEventListener('click', function () {
        document.querySelector('.messages-section').classList.remove('show');
    });

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

    // Función para abrir el modal de la imagen
    function openModal() {
        document.getElementById('imageModal').style.display = 'block';
    }

    // Función para cerrar el modal de la imagen
    function closeModal() {
        document.getElementById('imageModal').style.display = 'none';
    }

    // Función para mostrar la imagen actual en el modal
    function showImage(n) {
        var slides = document.getElementsByClassName('modal-slide');
        if (n >= slides.length) { currentSlide = 0; }
        if (n < 0) { currentSlide = slides.length - 1; }
        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        slides[currentSlide].style.display = 'block';
    }

    var currentSlide = 0;

    // Añadir evento de clic a las imágenes del carrusel
    var images = document.querySelectorAll('.carousel-inner img');
    images.forEach(function (image, index) {
        image.addEventListener('click', function () {
            currentSlide = index;
            openModal();
            showImage(currentSlide);
        });
    });

    // Añadir evento de clic a los botones de navegación
    document.getElementById('prev').addEventListener('click', function () {
        showImage(--currentSlide);
    });
    document.getElementById('next').addEventListener('click', function () {
        showImage(++currentSlide);
    });

    // Añadir evento de clic al botón de cerrar
    document.getElementById('closeModal').addEventListener('click', closeModal);

    // Cerrar el modal al hacer clic fuera de la imagen
    window.addEventListener('click', function (event) {
        if (event.target == document.getElementById('imageModal')) {
            closeModal();
        }
    });

    // Mostrar solo la imagen activa en el primer carrusel
    var firstCarouselItems = document.querySelectorAll('.carousel-inner .carousel-item');
    firstCarouselItems.forEach(function (item, index) {
        if (index === 0) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});