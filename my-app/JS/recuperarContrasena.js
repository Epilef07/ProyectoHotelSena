(function() {
    emailjs.init("6z9b6ZODOfrKmQbMM"); // Reemplaza con tu public key real de EmailJS
})();

$('#recuperarForm').on('submit', function(event) {
    event.preventDefault();
    
    // Mostrar mensaje de espera
    $('#mensaje').html('Enviando correo...').show();
    
    var email = $('#email').val();
    
    // Enviar solicitud al servidor para enviar el correo
    $.ajax({
        url: '/api/send-reset-email',
        method: 'POST',
        data: { email: email },
        success: function(response) {
            $('#mensaje')
                .html('¡Correo enviado! Por favor revisa tu bandeja de entrada.')
                .css('color', 'green')
                .show();
        },
        error: function(error) {
            $('#mensaje')
                .html('Error al enviar el correo. Por favor intenta nuevamente.')
                .css('color', 'red')
                .show();
            console.error('Error:', error);
        }
    });
});

// Manejador de clic para alternar el formulario (ya existente)
$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});


