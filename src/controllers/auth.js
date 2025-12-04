const jwt = require('jsonwebtoken');
const { Usuario, sequelize } = require('../models');

// Verificar que JWT_SECRET esté configurado
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
}

// Generar Access Token (expira en 1 hora)
const generarAccessToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            username: usuario.username,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Generar Refresh Token (expira en 7 días)
const generarRefreshToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            username: usuario.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /auth/login - Iniciar sesión
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({
                error: 'Username y password son obligatorios'
            });
        }
        
        // Buscar usuario por username
        const usuario = await Usuario.findOne({
            where: { username }
        });
        
        if (!usuario) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        // Verificar contraseña
        const passwordValida = await usuario.compararPassword(password);
        
        if (!passwordValida) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }
        
        // Generar tokens
        const accessToken = generarAccessToken(usuario);
        const refreshToken = generarRefreshToken(usuario);
        
        // Guardar refresh token en la base de datos
        await usuario.update({ refreshToken });
        
        // Excluir password del response
        const { password: _, refreshToken: __, ...usuarioData } = usuario.toJSON();
        
        res.status(200).json({
            mensaje: 'Login exitoso',
            usuario: usuarioData,
            accessToken,
            refreshToken
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            detalles: error.message
        });
    }
};

// POST /auth/refresh - Refrescar access token
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token es obligatorio'
            });
        }
        
        // Verificar refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                error: 'Refresh token inválido o expirado'
            });
        }
        
        // Buscar usuario y verificar que el refresh token coincida
        const usuario = await Usuario.findByPk(decoded.id);
        
        if (!usuario || usuario.refreshToken !== refreshToken) {
            return res.status(401).json({
                error: 'Refresh token inválido'
            });
        }
        
        // Generar nuevo access token
        const nuevoAccessToken = generarAccessToken(usuario);
        
        res.status(200).json({
            mensaje: 'Token refrescado exitosamente',
            accessToken: nuevoAccessToken
        });
        
    } catch (error) {
        console.error('Error al refrescar token:', error);
        res.status(500).json({
            error: 'Error al refrescar el token',
            detalles: error.message
        });
    }
};

// POST /auth/logout - Cerrar sesión
const logout = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id);
        
        if (usuario) {
            // Eliminar refresh token de la base de datos
            await usuario.update({ refreshToken: null });
        }
        
        res.status(200).json({
            mensaje: 'Logout exitoso'
        });
        
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            error: 'Error al cerrar sesión',
            detalles: error.message
        });
    }
};

// GET /auth/me - Obtener perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });
        
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        res.status(200).json({
            usuario
        });
        
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            error: 'Error al obtener el perfil',
            detalles: error.message
        });
    }
};

module.exports = {
    login,
    refresh,
    logout,
    obtenerPerfil
};