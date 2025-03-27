document.addEventListener('DOMContentLoaded', function() {
    // Obtener la contraseña de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const password = urlParams.get('password');
    
    if (password) {
        document.getElementById('password').value = password;
    }

    // Toggle para mostrar/ocultar contraseña
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});
