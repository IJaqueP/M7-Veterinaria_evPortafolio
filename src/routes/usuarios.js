const express = require('express');
const router = express.Router();
const {
    crearUsuario,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
    subirImagenPerfil
} = require('../controllers/usuarios');
const { verificarToken } = require('../middleware/auth');

// POST /usuarios - Crear nuevo usuario (público para registro)
router.post('/', crearUsuario);

// GET /usuarios/:id - Obtener perfil de usuario (protegido)
router.get('/:id', verificarToken, obtenerUsuario);

// PUT /usuarios/:id - Actualizar perfil de usuario (protegido)
router.put('/:id', verificarToken, actualizarUsuario);

// DELETE /usuarios/:id - Eliminar usuario (protegido)
router.delete('/:id', verificarToken, eliminarUsuario);

// POST /usuarios/:id/imagen - Subir imagen de perfil (protegido)
router.post('/:id/imagen', verificarToken, subirImagenPerfil);

module.exports = router;