const { Doctor } = require('../models');

// Buscar solo un Doctor (función reutilizable)
const obtenerDoctorPorId = async (id) => {
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
        throw new Error('Doctor no encontrado');
    }

    return doctor;
};

// 1. CRUD - CREATE
const crearDoctor = async (req, res) => {
    try {
        const { nombre, apellido, especialidad, email, telefono } = req.body;

        const doctor = await Doctor.create(
            {
                nombre, apellido, especialidad, email, telefono
            }
        );

        res.status(201).json(
            {
                mensaje: 'Doctor creado exitosamente',
                doctor
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al crear Doctor',
                detalle: err.message
            }
        );
    }
};

// 2. CRUD - READ
const leerDoctores = async(req, res) => {
    try {
        const doctores = await Doctor.findAll({
            order: [['id', 'ASC']]
        });

        res.status(200).json(
            {
                doctores
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al generar lista de Doctores',
                detalle: error.message
            }
        );
    }
};

// 3. CRUD - UPDATE
const actualizarDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, especialidad, email, telefono } = req.body;

        const doctor = await obtenerDoctorPorId(id);

        await doctor.update(
            {
                nombre: nombre || doctor.nombre,
                apellido: apellido || doctor.apellido,
                especialidad: especialidad || doctor.especialidad,
                email: email || doctor.email,
                telefono: telefono || doctor.telefono
            }
        );

        res.status(200).json(
            {
                mensaje: 'Doctor actualizado correctamente',
                doctor
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al actualizar datos',
                detalle: err.message
            }
        );
    }
};

// 4. CRUD - DELETE
const eliminarDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = obtenerDoctorPorId(id);

        await doctor.destroy();

        res.status(200).json(
            {
                mensaje: 'Doctor eliminado exitosamente'
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al eliminar Doctor',
                detalle: err.message
            }
        );
    }
};

module.exports = {
    crearDoctor,
    leerDoctores,
    actualizarDoctor,
    eliminarDoctor
};