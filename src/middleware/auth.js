const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Verificar que JWT_SECRET esté configurado
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}

// Middleware para verificar JWT
const verificarToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                error: 'No se proporcionó token de autenticación',
                mensaje: 'Debes incluir el header Authorization: Bearer <token>'
            });
        }
        
        // Verificar formato Bearer token
        const partes = authHeader.split(' ');
        
        if (partes.length !== 2 || partes[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Formato de token inválido',
                mensaje: 'El formato debe ser: Authorization: Bearer <token>'
            });
        }
        
        const token = partes[1];
        
        // Verificar y decodificar token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Token expirado',
                    mensaje: 'El token ha expirado. Por favor, refresca tu token o inicia sesión nuevamente.'
                });
            }
            
            return res.status(401).json({
                error: 'Token inválido',
                mensaje: 'El token proporcionado no es válido'
            });
        }
        
        // Buscar usuario en la base de datos
        const usuario = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });
        
        if (!usuario) {
            return res.status(401).json({
                error: 'Usuario no encontrado',
                mensaje: 'El usuario asociado al token no existe'
            });
        }
        
        // Agregar información del usuario al request
        req.usuario = usuario;
        
        next();
        
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        res.status(500).json({
            error: 'Error al verificar autenticación',
            detalles: error.message
        });
    }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                error: 'Usuario no autenticado'
            });
        }
        
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: 'No tienes permiso para acceder a este recurso',
                mensaje: `Rol requerido: ${rolesPermitidos.join(' o ')}`
            });
        }
        
        next();
    };
};

module.exports = {
    verificarToken,
    verificarRol
};