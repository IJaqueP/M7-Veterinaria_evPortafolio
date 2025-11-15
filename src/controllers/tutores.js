const { Tutor, sequelize } = require('../models');

// Buscar solo un Tutor (función reutilizable)
const buscarTutorPorId = async (id) => {
    const tutor = await Tutor.findByPk(id);
    
    if (!tutor) {
        throw new Error('Tutor no encontrado')
    }

    return tutor;

};

// 1. CRUD - CREATE
const crearTutor = async (req, res) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
        const {
            nombre,
            apellido,
            email,
            telefono,
            direccion
        } = req.body;

        const emailExiste = await Tutor.findOne(
            {
                where: { email },
                transaction
            }
        );

        if (emailExiste) {
            throw new Error('El email ya está registrado');
        }

        const tutor = await Tutor.create(
            {
                nombre,
                apellido,
                email,
                telefono,
                direccion
            }, { transaction }
        );

        await transaction.commit();

        res.status(201).json(
            {
                mensaje: 'Tutor creado exitosamente',
                tutor
            }
        );

    } catch (err) {

        await transaction.rollback();

        res.status(500).json(
            {
                error: 'No se ha podido crear al tutor',
                detalle: err.message
            }
        );
    }
};

// 2. CRUD - READ
const leerTutores = async (req, res) => {
    try {
        const tutores = await Tutor.findAll(
            {
                order: [['id', 'ASC']]
            }
        );

        res.status(200).json(
            {
                tutores
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al listar los tutores',
                detalle: err.message
            }
        );
    }
};

// 3. CRUD - UPDATE
const actualizarTutor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, telefono, direccion } = req.body;

        const tutor = await buscarTutorPorId(id);

        await tutor.update(
            {
                nombre, apellido, email, telefono, direccion
            }
        );

        res.status(200).json(
            {
                mensaje: 'Tutor actualizado correctamente',
                tutor
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                mensaje: 'Error al actualizar al tutor',
                detalle: err.message
            }
        );
    }
};

// 4. CRUD - DELETE
const eliminarTutor = async (req, res) => {
    try {
        const { id } = req.params;

        const tutor = await buscarTutorPorId(id);

        await tutor.destroy();

        res.status(200).json(
            {
                mensaje: 'Tutor eliminado correctamente'
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al eliminar al tutor',
                detalle: err.message
            }
        );
    }
};

module.exports = {
    crearTutor,
    leerTutores,
    actualizarTutor,
    eliminarTutor
}