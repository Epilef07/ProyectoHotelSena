document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    var modal = document.getElementById("productModal");
    var openModalBtn = document.getElementById("openModalBtn");
    var closeModalBtn = document.getElementById("closeModalBtn");

    var assignModal = document.getElementById("assignProductModal");
    var closeAssignModalBtn = document.getElementById("closeAssignModalBtn");

    var unassignModal = document.getElementById("unassignProductModal");
    var closeUnassignModalBtn = document.getElementById("closeUnassignModalBtn");

    openModalBtn.onclick = function() {
        modal.style.display = "block";
    }

    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    }

    closeAssignModalBtn.onclick = function() {
        assignModal.style.display = "none";
    }

    closeUnassignModalBtn.onclick = function() {
        unassignModal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        } else if (event.target == assignModal) {
            assignModal.style.display = "none";
        } else if (event.target == unassignModal) {
            unassignModal.style.display = "none";
        }
    }

    // Modal para agregar a producto existente
    var addToExistingModal = document.getElementById("addToExistingModal");
    var addToExistingBtn = document.getElementById("addToExistingBtn");
    var closeAddToExistingModalBtn = document.getElementById("closeAddToExistingModalBtn");

    addToExistingBtn.onclick = function() {
        addToExistingModal.style.display = "block";
    };

    closeAddToExistingModalBtn.onclick = function() {
        addToExistingModal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target == addToExistingModal) {
            addToExistingModal.style.display = "none";
        }
    };

    // Manejar el envío del formulario para agregar a producto existente
    document.getElementById('addToExistingForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var productId = document.getElementById('existingProductId').value.trim();
        var additionalQuantity = document.getElementById('additionalQuantity').value.trim();

        // Validar que los campos estén llenos
        if (!productId || !additionalQuantity || additionalQuantity <= 0) {
            document.getElementById('addToExistingFormMessage').textContent = "Por favor, ingrese un ID válido y una cantidad mayor a 0.";
            document.getElementById('addToExistingFormMessage').style.color = "red";
            return;
        }

        // Depurar los datos enviados al servidor
        console.log("Enviando datos al servidor:", { productId: parseInt(productId), additionalQuantity: parseInt(additionalQuantity) });

        // Llamar a la API para agregar cantidad al producto existente
        fetch('/api/agregar_a_existente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: parseInt(productId), additionalQuantity: parseInt(additionalQuantity) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('addToExistingFormMessage').textContent = "Cantidad agregada exitosamente.";
                document.getElementById('addToExistingFormMessage').style.color = "green";

                // Cerrar el modal después de un breve retraso
                setTimeout(function() {
                    addToExistingModal.style.display = "none";
                    document.getElementById('addToExistingForm').reset();
                    document.getElementById('addToExistingFormMessage').textContent = "";
                    loadProducts(); // Recargar los productos para actualizar la cantidad disponible
                }, 2000);
            } else {
                document.getElementById('addToExistingFormMessage').textContent = data.message;
                document.getElementById('addToExistingFormMessage').style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error al agregar cantidad al producto existente:", error);
            document.getElementById('addToExistingFormMessage').textContent = "Ocurrió un error. Por favor, inténtelo de nuevo.";
            document.getElementById('addToExistingFormMessage').style.color = "red";
        });
    });

    function saveProductToDatabase(product) {
        return fetch('/api/productos_minibar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .catch(error => {
            console.error("Error al guardar el producto en la base de datos:", error);
            throw error;
        });
    }

    function addProductCard(product) {
        try {
            const productCards = document.getElementById('productCards');

            const card = document.createElement('div');
            card.className = 'info-card';

            const id = document.createElement('p');
            id.innerHTML = `<strong>ID:</strong> ${product.id}`;

            const name = document.createElement('h3');
            name.textContent = product.nombre;

            const disponible = document.createElement('p');
            disponible.innerHTML = `<strong>Disponible:</strong> ${product.disponible}`;

            const asignaciones = document.createElement('p');
            asignaciones.innerHTML = `<strong>Asignaciones:</strong><br>${
                product.asignaciones !== 'Ninguna'
                    ? product.asignaciones
                          .split(', ')
                          .map(asignacion => {
                              const [habitacion, cantidad] = asignacion.split(':');
                              return `Habitación ${habitacion.trim()}: ${cantidad.trim()}`;
                          })
                          .join('<br>')
                    : 'Ninguna'
            }`;

            const assignButton = document.createElement('button');
            assignButton.textContent = 'Asignar Habitación';
            assignButton.className = 'assign-room-btn add-product-btn';
            assignButton.setAttribute('data-id', product.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar Producto';
            deleteButton.className = 'delete-product-btn add-product-btn';
            deleteButton.setAttribute('data-id', product.id);

            card.appendChild(id);
            card.appendChild(name);
            card.appendChild(disponible);
            card.appendChild(asignaciones);
            card.appendChild(assignButton);
            card.appendChild(deleteButton);

            productCards.appendChild(card);
        } catch (error) {
            console.error("Error al agregar la tarjeta del producto:", error);
            alert("Ocurrió un error al mostrar el producto. Por favor, inténtelo de nuevo.");
        }
    }

    function openAssignModal(productId) {
        // Llenar el select de habitaciones disponibles
        fetch('/api/habitaciones-disponibles')
            .then(response => response.json())
            .then(data => {
                const roomSelect = document.getElementById('roomNumber');
                roomSelect.innerHTML = ''; // Limpiar opciones existentes

                data.forEach(habitacion => {
                    const option = document.createElement('option');
                    option.value = habitacion.numeroHabitacion;
                    option.textContent = `Habitación ${habitacion.numeroHabitacion}`;
                    roomSelect.appendChild(option);
                });

                // Abrir el modal
                assignModal.style.display = "block";

                // Manejar el envío del formulario
                document.getElementById('assignProductForm').onsubmit = function(event) {
                    event.preventDefault();
                    assignProductToRoom(productId);
                };
            })
            .catch(error => {
                console.error("Error al cargar las habitaciones disponibles:", error);
                alert("Ocurrió un error al cargar las habitaciones. Por favor, inténtelo de nuevo.");
            });
    }

    function assignProductToRoom(productId) {
        const roomNumber = document.getElementById('roomNumber').value;
        const assignQuantity = parseInt(document.getElementById('assignQuantity').value);

        if (assignQuantity <= 0) {
            alert("La cantidad a asignar debe ser mayor a 0.");
            return;
        }

        const data = {
            productoId: productId,
            habitacion: roomNumber,
            cantidad: assignQuantity
        };

        fetch('/api/asignar_producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('assignFormMessage');
            if (data.success) {
                // Mostrar mensaje de éxito
                messageElement.textContent = "Producto asignado correctamente.";
                messageElement.style.color = "green";

                // Actualizar el disponible y las asignaciones en la interfaz
                const productCard = document.querySelector(`.info-card [data-id="${productId}"]`).parentElement;
                const disponibleElement = productCard.querySelector('p:nth-child(3)');
                const asignacionesElement = productCard.querySelector('p:nth-child(4)');

                const disponibleActual = parseInt(disponibleElement.textContent.split(': ')[1]);
                disponibleElement.innerHTML = `<strong>Disponible:</strong> ${disponibleActual - assignQuantity}`;

                // Actualizar las asignaciones
                let asignacionesActuales = asignacionesElement.innerHTML.split('<br>').slice(1); // Obtener asignaciones existentes
                const asignacionesMap = asignacionesActuales.reduce((map, asignacion) => {
                    const [habitacion, cantidad] = asignacion.split(':').map(s => s.trim());
                    map[habitacion] = parseInt(cantidad);
                    return map;
                }, {});

                // Sumar la cantidad asignada a la habitación correspondiente
                if (asignacionesMap[`Habitación ${roomNumber}`]) {
                    asignacionesMap[`Habitación ${roomNumber}`] += assignQuantity;
                } else {
                    asignacionesMap[`Habitación ${roomNumber}`] = assignQuantity;
                }

                // Ordenar las asignaciones por número de habitación
                const asignacionesOrdenadas = Object.entries(asignacionesMap)
                    .sort(([habitacionA], [habitacionB]) => habitacionA.localeCompare(habitacionB))
                    .map(([habitacion, cantidad]) => `${habitacion}: ${cantidad}`)
                    .join('<br>');

                asignacionesElement.innerHTML = `<strong>Asignaciones:</strong><br>${asignacionesOrdenadas}`;

                // Cerrar el modal automáticamente después de un breve retraso
                setTimeout(() => {
                    assignModal.style.display = "none";
                    messageElement.textContent = ""; // Limpiar el mensaje
                }, 2000);
            } else {
                // Mostrar mensaje de error
                messageElement.textContent = data.message || "Ocurrió un error al asignar el producto.";
                messageElement.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error al asignar el producto:", error);
            const messageElement = document.getElementById('assignFormMessage');
            messageElement.textContent = "Ocurrió un error al asignar el producto. Por favor, inténtelo de nuevo.";
            messageElement.style.color = "red";
        });
    }

    function openUnassignModal(productId) {
        // Llenar el select con todas las habitaciones
        fetch('/api/habitaciones')
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudieron cargar las habitaciones.");
                }
                return response.json();
            })
            .then(data => {
                const roomSelect = document.getElementById('unassignRoomNumber');
                roomSelect.innerHTML = ''; // Limpiar opciones existentes

                if (data.length === 0) {
                    alert("No hay habitaciones disponibles.");
                    return;
                }

                data.forEach(habitacion => {
                    const option = document.createElement('option');
                    option.value = habitacion.numeroHabitacion;
                    option.textContent = `Habitación ${habitacion.numeroHabitacion}`;
                    roomSelect.appendChild(option);
                });

                // Abrir el modal
                unassignModal.style.display = "block";
            })
            .catch(error => {
                console.error("Error al cargar las habitaciones:", error);
                alert("Ocurrió un error al cargar las habitaciones. Por favor, inténtelo de nuevo.");
            });
    }

    function unassignProductFromRoom(productId) {
        const roomNumber = document.getElementById('unassignRoomNumber').value;
        const unassignQuantity = parseInt(document.getElementById('unassignQuantity').value);

        if (unassignQuantity <= 0) {
            alert("La cantidad a desasignar debe ser mayor a 0.");
            return;
        }

        const data = {
            productoId: productId,
            habitacion: roomNumber,
            cantidad: unassignQuantity
        };

        fetch('/api/desasignar_producto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const messageElement = document.getElementById('unassignFormMessage');
            if (data.success) {
                // Mostrar mensaje de éxito
                messageElement.textContent = "Producto desasignado correctamente.";
                messageElement.style.color = "green";

                // Actualizar el disponible y las asignaciones en la interfaz
                const productCard = document.querySelector(`.info-card [data-id="${productId}"]`).parentElement;
                const disponibleElement = productCard.querySelector('p:nth-child(3)');
                const asignacionesElement = productCard.querySelector('p:nth-child(4)');

                const disponibleActual = parseInt(disponibleElement.textContent.split(': ')[1]);
                disponibleElement.innerHTML = `<strong>Disponible:</strong> ${disponibleActual + unassignQuantity}`;

                // Actualizar las asignaciones
                let asignacionesActuales = asignacionesElement.innerHTML.split('<br>').slice(1); // Obtener asignaciones existentes
                const asignacionesMap = asignacionesActuales.reduce((map, asignacion) => {
                    const [habitacion, cantidad] = asignacion.split(':').map(s => s.trim());
                    map[habitacion] = parseInt(cantidad);
                    return map;
                }, {});

                // Restar la cantidad desasignada a la habitación correspondiente
                if (asignacionesMap[`Habitación ${roomNumber}`]) {
                    asignacionesMap[`Habitación ${roomNumber}`] -= unassignQuantity;
                    if (asignacionesMap[`Habitación ${roomNumber}`] <= 0) {
                        delete asignacionesMap[`Habitación ${roomNumber}`]; // Eliminar si la cantidad es 0 o menor
                    }
                }

                // Ordenar las asignaciones por número de habitación
                const asignacionesOrdenadas = Object.entries(asignacionesMap)
                    .sort(([habitacionA], [habitacionB]) => habitacionA.localeCompare(habitacionB))
                    .map(([habitacion, cantidad]) => `${habitacion}: ${cantidad}`)
                    .join('<br>');

                asignacionesElement.innerHTML = `<strong>Asignaciones:</strong><br>${asignacionesOrdenadas || 'Ninguna'}`;

                // Cerrar el modal automáticamente después de un breve retraso
                setTimeout(() => {
                    unassignModal.style.display = "none";
                    messageElement.textContent = ""; // Limpiar el mensaje
                }, 2000);
            } else {
                // Mostrar mensaje de error
                messageElement.textContent = data.message || "Ocurrió un error al desasignar el producto.";
                messageElement.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error al desasignar el producto:", error);
            const messageElement = document.getElementById('unassignFormMessage');
            messageElement.textContent = "Ocurrió un error al desasignar el producto. Por favor, inténtelo de nuevo.";
            messageElement.style.color = "red";
        });
    }

    function loadProducts() {
        fetch('/api/productos_minibar?referencia=todos')
            .then(response => response.json())
            .then(data => {
                console.log("Respuesta de la API:", data); // Depurar la respuesta
                const productCards = document.getElementById('productCards');
                productCards.innerHTML = ''; // Limpiar las tarjetas existentes

                // Verificar si la respuesta es un array
                if (Array.isArray(data)) {
                    data.forEach(product => {
                        addProductCard(product); // Usar la función para agregar cada producto
                    });
                } else if (data.success) {
                    data.products.forEach(product => {
                        addProductCard(product); // Usar la función para agregar cada producto
                    });
                } else {
                    console.error("Error al cargar los productos:", data.message || "Estructura de respuesta inesperada.");
                }
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }

    // Cargar habitaciones en el modal de asignar producto
    function loadRooms() {
        fetch('/api/habitaciones')
            .then(response => response.json())
            .then(data => {
                const roomSelect = document.getElementById('roomNumber');
                roomSelect.innerHTML = '<option value="">Seleccione una habitación</option>'; // Limpiar las opciones existentes

                data.forEach(habitacion => {
                    const ocupada = habitacion.ocupada === 1 ? ' (Ocupada)' : ' (Libre)';
                    const option = document.createElement('option');
                    option.value = habitacion.numeroHabitacion;
                    option.textContent = `Habitación ${habitacion.numeroHabitacion}${ocupada}`;
                    roomSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar las habitaciones:', error));
    }

    // Abrir el modal y cargar las habitaciones
    document.getElementById('assignProductModal').addEventListener('show', loadRooms);

    // Llamar a loadProducts al cargar la página
    document.addEventListener('DOMContentLoaded', loadProducts);

    function searchProducts() {
        try {
            const searchRef = document.getElementById('searchRef').value.trim(); // Asegurarse de que no haya espacios
            const searchName = document.getElementById('searchName').value.trim().toLowerCase();

            fetch(`/api/productos_minibar?referencia=${encodeURIComponent(searchRef)}&nombre=${encodeURIComponent(searchName)}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Respuesta de la API:", data); // Depurar la respuesta
                    const productCards = document.getElementById('productCards');
                    productCards.innerHTML = ''; // Limpiar las tarjetas existentes

                    // Verificar si la respuesta es un array
                    if (Array.isArray(data)) {
                        data.forEach(product => {
                            addProductCard(product); // Usar la función para agregar cada producto
                        });

                        if (data.length === 0) {
                            alert("No se encontraron productos que coincidan con los criterios de búsqueda.");
                        }
                    } else if (data.success) {
                        data.products.forEach(product => {
                            addProductCard(product); // Usar la función para agregar cada producto
                        });

                        if (data.products.length === 0) {
                            alert("No se encontraron productos que coincidan con los criterios de búsqueda.");
                        }
                    } else {
                        throw new Error(data.message || "Error desconocido en la respuesta de la API.");
                    }
                })
                .catch(error => {
                    console.error("Error al buscar los productos:", error);
                    alert("Ocurrió un error al buscar los productos. Por favor, inténtelo de nuevo.");
                });
        } catch (error) {
            console.error("Error al buscar los productos:", error);
            alert("Ocurrió un error al buscar los productos. Por favor, inténtelo de nuevo.");
        }
    }

    // Manejar la búsqueda de productos
    document.getElementById('searchBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Evitar comportamiento predeterminado del botón
        searchProducts(); // Llamar a la función de búsqueda
    });

    // Asignar evento al botón de "Asignar Habitación"
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('assign-room-btn')) {
            const productId = event.target.getAttribute('data-id');
            openAssignModal(productId);
        }
    });

    // Asignar evento al botón de "Desasignar Habitación"
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('unassign-room-btn')) {
            const productId = event.target.parentElement.querySelector('[data-id]').getAttribute('data-id');
            openUnassignModal(productId);
        }
    });

    // Abrir el modal para eliminar producto
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-product-btn')) {
            const productId = event.target.getAttribute('data-id');
            document.getElementById('deleteProductId').value = productId; // Prellenar el ID del producto
            document.getElementById('deleteProductModal').style.display = 'block';
        }
    });

    // Cerrar el modal de eliminar producto
    document.getElementById('closeDeleteProductModalBtn').addEventListener('click', function() {
        document.getElementById('deleteProductModal').style.display = 'none';
    });

    // Manejar el formulario de eliminación de producto
    document.getElementById('deleteProductForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const productId = document.getElementById('deleteProductId').value;

        fetch(`/api/eliminar_producto`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: parseInt(productId) })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud al servidor.');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Mostrar mensaje de éxito con SweetAlert2
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Producto eliminado exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    document.getElementById('deleteProductModal').style.display = 'none'; // Cerrar el modal
                    loadProducts(); // Recargar los productos
                });
            } else {
                // Mostrar mensaje de error con SweetAlert2
                Swal.fire({
                    title: 'Error',
                    text: data.message || 'Ocurrió un error al eliminar el producto.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error('Error al eliminar el producto:', error);
            // Mostrar mensaje de error con SweetAlert2
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al eliminar el producto. Por favor, inténtelo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        });
    });

    // Cargar productos al cargar la página
    loadProducts();
});

// Manejo del modal para agregar productos
document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const productRef = document.getElementById('productRef').value.trim();
    const productPrice = parseFloat(document.getElementById('productPrice').value.trim());
    const productQuantity = parseInt(document.getElementById('productQuantity').value.trim());

    if (!productName || !productRef || isNaN(productPrice) || isNaN(productQuantity)) {
        document.getElementById('formMessage').textContent = "Todos los campos son obligatorios.";
        document.getElementById('formMessage').style.color = "red";
        return;
    }

    const productData = {
        nombre: productName,
        referencia: productRef,
        precio: productPrice,
        cantidad: productQuantity
    };

    fetch('/api/productos_minibar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('formMessage').textContent = "Producto agregado exitosamente.";
            document.getElementById('formMessage').style.color = "green";

            // Recargar la página después de un breve retraso
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            document.getElementById('formMessage').textContent = data.message || "Ocurrió un error inesperado.";
            document.getElementById('formMessage').style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error al agregar el producto:", error);
        document.getElementById('formMessage').textContent = "Ocurrió un error. Por favor, inténtelo de nuevo.";
        document.getElementById('formMessage').style.color = "red";
    });
});

// Mostrar y ocultar el modal
document.getElementById('openModalBtn').onclick = function() {
    document.getElementById('productModal').style.display = "block";
};
document.getElementById('closeModalBtn').onclick = function() {
    document.getElementById('productModal').style.display = "none";
};
window.onclick = function(event) {
    if (event.target == document.getElementById('productModal')) {
        document.getElementById('productModal').style.display = "none";
    }
};

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('assign-room-btn')) {
        const productId = event.target.getAttribute('data-id');
        document.getElementById('assignProductModal').style.display = 'block'; // Mostrar el modal
        cargarHabitaciones(); // Cargar las habitaciones al abrir el modal
    }
});

// Cerrar el modal
document.getElementById('closeAssignModalBtn').addEventListener('click', function() {
    document.getElementById('assignProductModal').style.display = 'none';
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('assign-room-btn')) {
        const productId = event.target.getAttribute('data-id');
        document.getElementById('assignProductModal').style.display = 'block';
        cargarHabitacionesAsignar(); // Cargar las habitaciones al abrir el modal
    }
});

// Cerrar el modal
document.getElementById('closeAssignModalBtn').addEventListener('click', function() {
    document.getElementById('assignProductModal').style.display = 'none';
});

// Función para cargar las habitaciones en el modal de "Asignar Habitación"
function cargarHabitacionesAsignar() {
    fetch('/api/habitaciones')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('roomNumber'); // ID del <select> en el modal de "Asignar Habitación"
            select.innerHTML = '<option value="">Seleccione una habitación</option>'; // Limpiar las opciones existentes

            data.forEach(habitacion => {
                const ocupada = habitacion.ocupada === 1 ? ' (Ocupada)' : ' (Libre)';
                const option = document.createElement('option');
                option.value = habitacion.numeroHabitacion;
                option.textContent = `Habitación ${habitacion.numeroHabitacion}${ocupada}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al cargar las habitaciones:', error));
}

// Llamar a la función al abrir el modal
document.getElementById('assignProductModal').addEventListener('show', cargarHabitacionesAsignar);

// Función para cargar habitaciones en el modal de "Asignar Habitación"
function cargarHabitaciones() {
    fetch('/api/habitaciones')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener las habitaciones.');
            }
            return response.json();
        })
        .then(data => {
            const roomSelect = document.getElementById('roomNumber'); // ID del <select> en el modal
            roomSelect.innerHTML = '<option value="">Seleccione una habitación</option>'; // Limpiar las opciones existentes

            data.forEach(habitacion => {
                const ocupada = habitacion.ocupada === 1 ? ' (Ocupada)' : ' (Libre)';
                const option = document.createElement('option');
                option.value = habitacion.numeroHabitacion;
                option.textContent = `Habitación ${habitacion.numeroHabitacion}${ocupada}`;
                roomSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar las habitaciones:', error);
        });
}

// Llamar a la función al abrir el modal
document.getElementById('assignProductModal').addEventListener('show', cargarHabitaciones);

function obtenerTodasLasHabitaciones() {
    fetch('/api/habitaciones')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('numeroHabitacion'); // ID del <select> en el modal de "Reserva"
            select.innerHTML = '<option value="">Seleccione una habitación</option>';

            data.forEach(habitacion => {
                const ocupada = habitacion.ocupada === 1 ? ' (Ocupada)' : ' (Libre)';
                const option = document.createElement('option');
                option.value = habitacion.numeroHabitacion;
                option.textContent = `Habitación ${habitacion.numeroHabitacion} ${ocupada}`;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener habitaciones:', error));
}
