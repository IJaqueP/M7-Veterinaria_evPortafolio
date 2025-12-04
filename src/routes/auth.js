const express = require('express');
const router = express.Router();
const {
    login,
    refresh,
    logout,
    obtenerPerfil
} = require('../controllers/auth');
const { verificarToken } = require('../middleware/auth');

// POST /auth/login - Iniciar sesión
router.post('/login', login);

// POST /auth/refresh - Refrescar access token
router.post('/refresh', refresh);

// POST /auth/logout - Cerrar sesión (protegido)
router.post('/logout', verificarToken, logout);

// GET /auth/me - Obtener perfil del usuario autenticado (protegido)
router.get('/me', verificarToken, obtenerPerfil);

module.exports = router;