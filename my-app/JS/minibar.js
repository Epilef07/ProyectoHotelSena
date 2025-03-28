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

            const unassignButton = document.createElement('button');
            unassignButton.textContent = 'Desasignar Habitación';
            unassignButton.className = 'unassign-room-btn add-product-btn';

            card.appendChild(id);
            card.appendChild(name);
            card.appendChild(disponible);
            card.appendChild(asignaciones);
            card.appendChild(assignButton);
            card.appendChild(unassignButton);

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
                const productCards = document.getElementById('productCards');
                productCards.innerHTML = ''; // Limpiar las tarjetas existentes

                if (data.success) {
                    data.products.forEach(product => {
                        addProductCard(product); // Usar la función para agregar cada producto
                    });
                } else {
                    console.error("Error al cargar los productos:", data.message);
                }
            })
            .catch(error => {
                console.error('Error al cargar los productos:', error);
            });
    }

    // Llamar a loadProducts al cargar la página
    document.addEventListener('DOMContentLoaded', loadProducts);

    function searchProducts() {
        try {
            const searchRef = document.getElementById('searchRef').value;
            const searchName = document.getElementById('searchName').value.toLowerCase();

            fetch(`/api/productos_minibar?referencia=${searchRef}&nombre=${searchName}`)
                .then(response => response.json())
                .then(data => {
                    const productCards = document.getElementById('productCards');
                    productCards.innerHTML = ''; // Limpiar las tarjetas existentes

                    if (data.success) {
                        data.products.forEach(product => {
                            addProductCard(product); // Usar la función para agregar cada producto
                        });

                        if (data.products.length === 0) {
                            alert("No se encontraron productos que coincidan con los criterios de búsqueda.");
                        }
                    } else {
                        throw new Error(data.message);
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

// Nueva función para buscar productos del minibar con asignaciones y disponibilidad
app.get('/api/buscar_productos', (req, res) => {
    const { referencia, nombre } = req.query;

    let query = `
        SELECT 
            pm.id, 
            pm.nombre, 
            pm.referencia, 
            pm.precio, 
            pm.imagen, 
            pm.cantidad, 
            COALESCE(SUM(ap.cantidad), 0) AS totalAsignado,
            (pm.cantidad - COALESCE(SUM(ap.cantidad), 0)) AS disponible,
            IFNULL(GROUP_CONCAT(CONCAT(ap.numeroHabitacion, ':', ap.cantidad) SEPARATOR ', '), 'Ninguna') AS asignaciones
        FROM producto_minibar pm
        LEFT JOIN asignacion_producto ap ON pm.id = ap.productoId
    `;

    let params = [];
    let conditions = [];

    // Filtrar por referencia si se proporciona
    if (referencia && referencia.toLowerCase() !== 'todos') {
        conditions.push(`LOWER(pm.referencia) = ?`);
        params.push(referencia.toLowerCase());
    }

    // Filtrar por nombre si se proporciona
    if (nombre) {
        conditions.push(`LOWER(pm.nombre) LIKE ?`);
        params.push(`%${nombre.toLowerCase()}%`);
    }

    // Agregar condiciones a la consulta si existen
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY pm.id, pm.nombre, pm.referencia, pm.precio, pm.imagen, pm.cantidad`;

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("Error al buscar productos del minibar:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error al buscar productos",
                error: err.message 
            });
        }

        // Ajustar los valores nulos de asignaciones y calcular correctamente los disponibles
        results.forEach(product => {
            product.asignaciones = product.asignaciones || 'Ninguna';
            product.disponible = Math.max(0, product.disponible); // Asegurar que no sea negativo
        });

        res.json({
            success: true, 
            products: results
        });
    });
});