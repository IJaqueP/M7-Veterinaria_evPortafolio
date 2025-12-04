require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const { sequelize } = require('./src/models');

// Importar rutas
const tutoresRoutes = require('./src/routes/tutores');
const pacientesRoutes = require('./src/routes/pacientes');
const usuariosRoutes = require('./src/routes/usuarios');
const authRoutes = require('./src/routes/auth');

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express-fileupload
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
    abortOnLimit: true,
    responseOnLimit: 'El archivo es demasiado grande. Tamaño máximo: 5 MB',
    createParentPath: true,
    useTempFiles: false
}));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/tutores', tutoresRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Veterinaria - Sistema de Gestión con Autenticación JWT',
        version: '2.0.0',
        endpoints: {
            autenticacion: {
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                logout: 'POST /api/auth/logout (requiere token)',
                perfil: 'GET /api/auth/me (requiere token)'
            },
            usuarios: {
                crear: 'POST /api/usuarios',
                obtener: 'GET /api/usuarios/:id (requiere token)',
                actualizar: 'PUT /api/usuarios/:id (requiere token)',
                eliminar: 'DELETE /api/usuarios/:id (requiere token)',
                subirImagen: 'POST /api/usuarios/:id/imagen (requiere token)'
            },
            tutores: {
                listar: 'GET /api/tutores',
                crear: 'POST /api/tutores',
                actualizar: 'PUT /api/tutores/:id',
                eliminar: 'DELETE /api/tutores/:id'
            },
            pacientes: {
                listar: 'GET /api/pacientes',
                crear: 'POST /api/pacientes',
                actualizar: 'PUT /api/pacientes/:id',
                eliminar: 'DELETE /api/pacientes/:id'
            }
        },
        documentacion: 'Ver README.md para instrucciones detalladas'
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        mensaje: 'La ruta solicitada no existe en esta API'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        detalles: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Sincronizar base de datos y arrancar servidor
sequelize.sync({ force: false })
    .then(() => {
        console.log('✓ Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`✓ Documentación de API disponible en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('✗ Error al sincronizar la base de datos:', err);
        process.exit(1);
    });

module.exports = app;