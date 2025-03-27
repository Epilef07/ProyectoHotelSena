document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.status === 200) {
            // Redirigir al menú después de un inicio de sesión exitoso
            window.location.href = '/HTML/menu.html';
        } else if (response.status === 401) {
            // Mostrar alerta en caso de error
            alert('Nombre de usuario o contraseña incorrectos');
            // Limpiar los campos del formulario
            document.getElementById('loginForm').reset();
        } else {
            return response.json().then(result => {
                alert(result.message);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al iniciar sesión');
        // Limpiar los campos del formulario
        document.getElementById('loginForm').reset();
    });
});
