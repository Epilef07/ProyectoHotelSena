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

    // Manejar el envío del formulario para agregar productos
    document.getElementById('productForm').addEventListener('submit', function(event) {
        event.preventDefault();

        try {
            var productName = document.getElementById('productName').value.trim();
            var productRef = document.getElementById('productRef').value.trim();
            var productPrice = document.getElementById('productPrice').value.trim();
            var productImage = document.getElementById('productImage').value.trim();
            var productCantidad = document.getElementById('productQuantity').value.trim();

            // Validar que los campos obligatorios estén llenos
            if (!productName || !productRef || !productPrice || !productCantidad) {
                document.getElementById('formMessage').textContent = "Los campos Nombre, Referencia, Precio y Cantidad son obligatorios.";
                document.getElementById('formMessage').style.color = "red";
                return;
            }

            // Crear el objeto del producto
            var product = {
                nombre: productName,
                referencia: productRef,
                precio: parseFloat(productPrice),
                imagen: productImage || null, // Si no se proporciona, enviar null
                cantidad: parseInt(productCantidad)
            };

            // Llamar a la API para guardar el producto en la base de datos
            fetch('/api/productos_minibar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mostrar mensaje de éxito
                    document.getElementById('formMessage').textContent = "Producto agregado exitosamente.";
                    document.getElementById('formMessage').style.color = "green";

                    // Resetear el formulario
                    document.getElementById('productForm').reset();

                    // Recargar los productos
                    loadProducts();
                } else {
                    // Mostrar mensaje de error específico
                    document.getElementById('formMessage').textContent = data.message;
                    document.getElementById('formMessage').style.color = "red";
                    console.error("Error del servidor:", data.error);
                }
            })
            .catch(error => {
                console.error("Error al agregar el producto:", error);
                document.getElementById('formMessage').textContent = "Ocurrió un error al agregar el producto. Por favor, inténtelo de nuevo.";
                document.getElementById('formMessage').style.color = "red";
            });
        } catch (error) {
            console.error("Error al agregar el producto:", error);
            document.getElementById('formMessage').textContent = "Ocurrió un error al agregar el producto. Por favor, inténtelo de nuevo.";
            document.getElementById('formMessage').style.color = "red";
        }
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
            var productCards = document.getElementById('productCards');

            var card = document.createElement('div');
            card.className = 'info-card';

            var img = document.createElement('img');
            img.src = product.imagen;
            img.alt = product.nombre;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            img.style.marginBottom = '10px';

            var id = document.createElement('p');
            id.innerHTML = `<strong>ID:</strong> ${product.id}`; // Mostrar el ID en negrilla

            var name = document.createElement('h3');
            name.textContent = product.nombre;

            var disponible = document.createElement('p');
            disponible.textContent = 'Disponible: ' + (product.disponible >= 0 ? product.disponible : 0);

            var asignaciones = document.createElement('p');
            if (product.asignaciones && product.asignaciones !== 'Ninguna') {
                asignaciones.innerHTML = 'Asignaciones:<br>' + product.asignaciones
                    .split(', ')
                    .map(asignacion => asignacion.replace(':', ': ') + ' unidades')
                    .join('<br>');
            } else {
                asignaciones.textContent = 'Asignaciones: Ninguna';
            }

            var assignButton = document.createElement('button');
            assignButton.textContent = 'Asignar Habitación';
            assignButton.className = 'assign-room-btn add-product-btn';
            assignButton.setAttribute('data-id', product.id);

            assignButton.onclick = function() {
                openAssignModal(product.id);
            };

            var unassignButton = document.createElement('button');
            unassignButton.textContent = 'Desasignar Habitación';
            unassignButton.className = 'unassign-room-btn add-product-btn';
            unassignButton.setAttribute('data-id', product.id);

            unassignButton.onclick = function() {
                openUnassignModal(product.id);
            };

            card.appendChild(img);
            card.appendChild(id); // Agregar el ID al card
            card.appendChild(name);
            card.appendChild(disponible);
            card.appendChild(asignaciones);
            card.appendChild(assignButton);
            card.appendChild(unassignButton); // Agregar el botón de desasignar

            productCards.appendChild(card);
        } catch (error) {
            console.error("Error al agregar la tarjeta del producto:", error);
            alert("Ocurrió un error al mostrar el producto. Por favor, inténtelo de nuevo.");
        }
    }

    function openAssignModal(productId) {
        // Llenar el select de habitaciones disponibles
        fetch('/api/habitaciones')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    var roomSelect = document.getElementById('roomNumber');
                    roomSelect.innerHTML = ''; // Limpiar opciones existentes
                    data.habitaciones.forEach(function(habitacion) {
                        var option = document.createElement('option');
                        option.value = habitacion.numeroHabitacion;
                        option.textContent = habitacion.numeroHabitacion;
                        roomSelect.appendChild(option);
                    });
                    // Abrir el modal
                    assignModal.style.display = "block";
                    // Manejar el envío del formulario de asignación
                    document.getElementById('assignProductForm').onsubmit = function(event) {
                        event.preventDefault();
                        assignProductToRoom(productId);
                    };
                } else {
                    alert("No se pudieron cargar las habitaciones disponibles.");
                }
            })
            .catch(error => {
                console.error("Error al cargar las habitaciones:", error);
                alert("Ocurrió un error al cargar las habitaciones. Por favor, inténtelo de nuevo.");
            });
    }

    function assignProductToRoom(productId) {
        var roomNumber = document.getElementById('roomNumber').value;
        var assignQuantity = document.getElementById('assignQuantity').value;

        var data = {
            productoId: productId, // Usar el ID del producto
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
            if (data.success) {
                document.getElementById('assignFormMessage').textContent = "Producto asignado correctamente.";
                document.getElementById('assignFormMessage').style.color = "green";
                // Cerrar el modal después de un breve retraso
                setTimeout(function() {
                    assignModal.style.display = "none";
                    document.getElementById('assignProductForm').reset();
                    document.getElementById('assignFormMessage').textContent = "";
                    loadProducts(); // Recargar los productos para actualizar las asignaciones
                }, 2000);
            } else {
                document.getElementById('assignFormMessage').textContent = data.message;
                document.getElementById('assignFormMessage').style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error al asignar el producto:", error);
            document.getElementById('assignFormMessage').textContent = "Ocurrió un error al asignar el producto. Por favor, inténtelo de nuevo.";
            document.getElementById('assignFormMessage').style.color = "red";
        });
    }

    function openUnassignModal(productId) {
        // Llenar el select de habitaciones disponibles
        fetch('/api/habitaciones')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    var roomSelect = document.getElementById('unassignRoomNumber');
                    roomSelect.innerHTML = ''; // Limpiar opciones existentes
                    data.habitaciones.forEach(function(habitacion) {
                        var option = document.createElement('option');
                        option.value = habitacion.numeroHabitacion;
                        option.textContent = habitacion.numeroHabitacion;
                        roomSelect.appendChild(option);
                    });
                    // Abrir el modal
                    unassignModal.style.display = "block";
                    // Manejar el envío del formulario de desasignación
                    document.getElementById('unassignProductForm').onsubmit = function(event) {
                        event.preventDefault();
                        unassignProductFromRoom(productId);
                    };
                } else {
                    alert("No se pudieron cargar las habitaciones disponibles.");
                }
            })
            .catch(error => {
                console.error("Error al cargar las habitaciones:", error);
                alert("Ocurrió un error al cargar las habitaciones. Por favor, inténtelo de nuevo.");
            });
    }

    function unassignProductFromRoom(productId) {
        var roomNumber = document.getElementById('unassignRoomNumber').value;
        var unassignQuantity = document.getElementById('unassignQuantity').value;

        var data = {
            productoId: productId, // Usar el ID del producto
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
            if (data.success) {
                document.getElementById('unassignFormMessage').textContent = "Producto desasignado correctamente.";
                document.getElementById('unassignFormMessage').style.color = "green";
                // Cerrar el modal después de un breve retraso
                setTimeout(function() {
                    unassignModal.style.display = "none";
                    document.getElementById('unassignProductForm').reset();
                    document.getElementById('unassignFormMessage').textContent = "";
                    loadProducts(); // Recargar los productos para actualizar las asignaciones
                }, 2000);
            } else {
                document.getElementById('unassignFormMessage').textContent = data.message;
                document.getElementById('unassignFormMessage').style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error al desasignar el producto:", error);
            document.getElementById('unassignFormMessage').textContent = "Ocurrió un error al desasignar el producto. Por favor, inténtelo de nuevo.";
            document.getElementById('unassignFormMessage').style.color = "red";
        });
    }

    function loadProducts() {
        try {
            fetch('/api/productos_minibar_con_asignaciones')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        var productCards = document.getElementById('productCards');
                        productCards.innerHTML = ''; // Limpiar las tarjetas existentes
                        data.products.forEach(function(product) {
                            product.disponible = product.cantidad - product.totalAsignado; // Calcular la cantidad disponible
                            product.asignaciones = product.asignaciones || 'Ninguna'; // Asegurarse de que las asignaciones estén presentes
                            addProductCard(product);
                        });
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch(error => {
                    console.error("Error al cargar los productos:", error);
                    alert("Ocurrió un error al cargar los productos. Por favor, inténtelo de nuevo.");
                });
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            alert("Ocurrió un error al cargar los productos. Por favor, inténtelo de nuevo.");
        }
    }

    function searchProducts() {
        try {
            var searchRef = document.getElementById('searchRef').value;
            var searchName = document.getElementById('searchName').value.toLowerCase();

            fetch(`/api/productos_minibar?referencia=${searchRef}&nombre=${searchName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        var productCards = document.getElementById('productCards');
                        productCards.innerHTML = ''; // Limpiar las tarjetas existentes

                        // Agregar los productos filtrados al UI
                        data.products.forEach(function(product) {
                            product.disponible = product.cantidad - product.totalAsignado; // Calcular la cantidad disponible
                            product.asignaciones = product.asignaciones || 'Ninguna'; // Asegurarse de que las asignaciones estén presentes
                            addProductCard(product);
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

    // Cargar productos al cargar la página
    loadProducts();
});

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
