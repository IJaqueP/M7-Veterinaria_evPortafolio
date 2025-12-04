const { Usuario, sequelize } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Función auxiliar para buscar usuario por ID
const buscarUsuarioPorId = async (id) => {
    const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken'] }
    });
    
    if (!usuario) {
        throw new Error('Usuario no encontrado');
    }
    
    return usuario;
};

// CREATE - Crear nuevo usuario (registro sin autenticación)
const crearUsuario = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { username, password, email, rol } = req.body;
        
        // Validar campos requeridos
        if (!username || !password || !email) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Los campos username, password y email son obligatorios'
            });
        }
        
        // Verificar si el username ya existe
        const usernameExiste = await Usuario.findOne({
            where: { username },
            transaction
        });
        
        if (usernameExiste) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'El nombre de usuario ya está en uso'
            });
        }
        
        // Verificar si el email ya existe
        const emailExiste = await Usuario.findOne({
            where: { email },
            transaction
        });
        
        if (emailExiste) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }
        
        // Crear usuario
        const usuario = await Usuario.create({
            username,
            password,
            email,
            rol: rol || 'usuario'
        }, { transaction });
        
        await transaction.commit();
        
        // Excluir password del response
        const { password: _, refreshToken: __, ...usuarioData } = usuario.toJSON();
        
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: usuarioData
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al crear usuario:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Error de validación',
                detalles: error.errors.map(e => e.message)
            });
        }
        
        res.status(500).json({
            error: 'Error al crear el usuario',
            detalles: error.message
        });
    }
};

// READ - Obtener usuario por ID (protegido)
const obtenerUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el usuario autenticado solo pueda ver su propio perfil
        // o sea admin
        if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'admin') {
            return res.status(403).json({
                error: 'No tienes permiso para ver este perfil'
            });
        }
        
        const usuario = await buscarUsuarioPorId(id);
        
        res.status(200).json({
            usuario
        });
        
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        
        if (error.message === 'Usuario no encontrado') {
            return res.status(404).json({ error: error.message });
        }
        
        res.status(500).json({
            error: 'Error al obtener el usuario',
            detalles: error.message
        });
    }
};

// UPDATE - Actualizar usuario (protegido)
const actualizarUsuario = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { username, email, password, rol } = req.body;
        
        // Verificar que el usuario autenticado solo pueda actualizar su propio perfil
        // o sea admin
        if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({
                error: 'No tienes permiso para actualizar este perfil'
            });
        }
        
        const usuario = await Usuario.findByPk(id, { transaction });
        
        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Actualizar campos
        const camposActualizar = {};
        
        if (username && username !== usuario.username) {
            // Verificar que el nuevo username no exista
            const usernameExiste = await Usuario.findOne({
                where: { username },
                transaction
            });
            
            if (usernameExiste) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'El nombre de usuario ya está en uso'
                });
            }
            
            camposActualizar.username = username;
        }
        
        if (email && email !== usuario.email) {
            // Verificar que el nuevo email no exista
            const emailExiste = await Usuario.findOne({
                where: { email },
                transaction
            });
            
            if (emailExiste) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'El email ya está registrado'
                });
            }
            
            camposActualizar.email = email;
        }
        
        if (password) {
            camposActualizar.password = password;
        }
        
        // Solo admin puede cambiar roles
        if (rol && req.usuario.rol === 'admin') {
            camposActualizar.rol = rol;
        }
        
        await usuario.update(camposActualizar, { transaction });
        await transaction.commit();
        
        // Obtener usuario actualizado sin password
        const usuarioActualizado = await Usuario.findByPk(id, {
            attributes: { exclude: ['password', 'refreshToken'] }
        });
        
        res.status(200).json({
            mensaje: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al actualizar usuario:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Error de validación',
                detalles: error.errors.map(e => e.message)
            });
        }
        
        res.status(500).json({
            error: 'Error al actualizar el usuario',
            detalles: error.message
        });
    }
};

// DELETE - Eliminar usuario (protegido)
const eliminarUsuario = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        
        // Verificar que el usuario autenticado solo pueda eliminar su propio perfil
        // o sea admin
        if (req.usuario.id !== parseInt(id) && req.usuario.rol !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({
                error: 'No tienes permiso para eliminar este perfil'
            });
        }
        
        const usuario = await Usuario.findByPk(id, { transaction });
        
        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Eliminar imagen de perfil si existe
        if (usuario.imagenPerfil) {
            const imagenPath = path.join(__dirname, '../../uploads', usuario.imagenPerfil);
            try {
                await fs.unlink(imagenPath);
            } catch (err) {
                console.error('Error al eliminar imagen:', err);
            }
        }
        
        await usuario.destroy({ transaction });
        await transaction.commit();
        
        res.status(200).json({
            mensaje: 'Usuario eliminado exitosamente'
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al eliminar usuario:', error);
        
        res.status(500).json({
            error: 'Error al eliminar el usuario',
            detalles: error.message
        });
    }
};

// POST - Subir imagen de perfil (protegido)
const subirImagenPerfil = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        
        // Verificar que el usuario autenticado solo pueda subir imagen a su propio perfil
        if (req.usuario.id !== parseInt(id)) {
            await transaction.rollback();
            return res.status(403).json({
                error: 'No tienes permiso para modificar este perfil'
            });
        }
        
        // Verificar que se haya enviado un archivo
        if (!req.files || !req.files.imagen) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'No se ha proporcionado ninguna imagen'
            });
        }
        
        const imagen = req.files.imagen;
        
        // Validar tipo de archivo (solo imágenes)
        const extensionesPermitidas = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!extensionesPermitidas.includes(imagen.mimetype)) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP)'
            });
        }
        
        // Validar tamaño del archivo (máximo 5 MB)
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (imagen.size > maxSize) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'La imagen es demasiado grande. Tamaño máximo: 5 MB'
            });
        }
        
        const usuario = await Usuario.findByPk(id, { transaction });
        
        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }
        
        // Eliminar imagen anterior si existe
        if (usuario.imagenPerfil) {
            const imagenAnteriorPath = path.join(__dirname, '../../uploads', usuario.imagenPerfil);
            try {
                await fs.unlink(imagenAnteriorPath);
            } catch (err) {
                console.error('Error al eliminar imagen anterior:', err);
            }
        }
        
        // Generar nombre único para la imagen
        const extension = path.extname(imagen.name);
        const nombreArchivo = `perfil_${id}_${Date.now()}${extension}`;
        
        // Crear directorio uploads si no existe
        const uploadsDir = path.join(__dirname, '../../uploads');
        try {
            await fs.mkdir(uploadsDir, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
        
        // Guardar imagen
        const imagenPath = path.join(uploadsDir, nombreArchivo);
        await imagen.mv(imagenPath);
        
        // Actualizar usuario con la ruta de la imagen
        await usuario.update({
            imagenPerfil: nombreArchivo
        }, { transaction });
        
        await transaction.commit();
        
        res.status(200).json({
            mensaje: 'Imagen de perfil subida exitosamente',
            imagenUrl: `/uploads/${nombreArchivo}`
        });
        
    } catch (error) {
        await transaction.rollback();
        console.error('Error al subir imagen de perfil:', error);
        
        res.status(500).json({
            error: 'Error al subir la imagen de perfil',
            detalles: error.message
        });
    }
};

module.exports = {
    crearUsuario,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
    subirImagenPerfil
};