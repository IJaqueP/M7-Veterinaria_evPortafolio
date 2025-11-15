const { Paciente, Tutor, sequelize } = require('../models');

const obtenerPacientePorId = async (id, transaction = null) => {
    const paciente = await Paciente.findByPk(id, {
        include: [
            {
                model: Tutor,
                as: 'tutor',
                attributes: [
                    'id',
                    'nombre',
                    'apellido',
                    'email',
                    'telefono',
                    'direccion'
                ]
            }
        ],
        transaction
    });

    if (!paciente) {
        throw new Error('Paciente no encontrado');
    }

    return paciente;
};

// 1. CRUD - CREATE
const crearPaciente = async (req, res) => {
    // Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
        const {
            nombre,
            especie,
            raza,
            edad,
            esterilizado,
            sexo,
            tutor_id
        } = req.body;

        if (!nombre || !esterilizado || !tutor_id) {
            throw new Error('Los campos nombre, esterilizado e Id del tutor son obligatorios');
        }

        // Validar que el tutor existe
        const tutor = await Tutor.findByPk(tutor_id, { transaction });

        if (!tutor) {
            return res.status(404).json(
                {
                    error: 'Tutor no encontrado'
                }
            );
        }

        const paciente = await Paciente.create(
            {
                nombre, 
                especie,
                raza,
                edad,
                esterilizado,
                sexo,
                tutor_id
            }, { transaction }
        );

        const pacienteConTutor = await obtenerPacientePorId(paciente.id, transaction);

        await transaction.commit();

        res.status(201).json(
            {
                mensaje: 'Paciente creado exitosamente',
                paciente: pacienteConTutor
            }
        );

    } catch (err) {

        await transaction.rollback();

        res.status(500).json(
            {
                mensaje: 'Error al crear paciente',
                detalle: err.message
            }
        );
    }
};

// 2. CRUD - READ
const leerPacientes = async (req, res) => {
    try {
        const { tutor_id } = req.params;

        // Validar que el tutor existe
        const tutor = await Tutor.findByPk(tutor_id);
        if (!tutor) {
            return res.status(404).json(
                {
                    error: 'Tutor no encontrado'
                }
            );
        }

        const pacientes = await Paciente.findAll(
            {
                where: { tutor_id },
                include: [
                    {
                        model: Tutor,
                        as: 'tutor',
                        attributes: ['id', 'nombre', 'apellido', 'telefono']
                    }
                ],
                order: [['id', 'ASC']]
            }
        );

        res.status(200).json(
            {
                tutor: {
                    id: tutor.id,
                    nombre: `${tutor.nombre} ${tutor.apellido}`
                },
                total_pacientes: pacientes.length,
                pacientes
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al listar los pacientes',
                detalle: err.message
            }
        );
    }
};

// 3. CRUD - UPDATE
const actualizarPaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            especie,
            raza,
            edad,
            esterilizado,
            sexo,
            tutor_id
        } = req.body;

        const paciente = await obtenerPacientePorId(id);

        // En este caso, si se quisiera cambiar al tutor, validar que este exista
        if (tutor_id && tutor_id !== paciente.tutor_id) {
            const tutor = await Tutor.findByPk(tutor_id);
            if (!tutor) {
                return res.status(404).json(
                    {
                        error: 'Nuevo tutor no encontrado'
                    }
                );
            }
        }

        await paciente.update(
            {
                nombre: nombre || paciente.nombre,
                especie: especie || paciente.especie,
                raza: raza || paciente.raza,
                edad: edad !== undefined ? edad : paciente.edad,
                esterilizado: esterilizado !== undefined ? esterilizado : paciente.esterilizado,
                sexo: sexo || paciente.sexo,
                tutor_id: tutor_id || paciente.tutor_id
            }
        );

        const pacienteActualizado = await obtenerPacientePorId(id);

        res.status(200).json(
            {
                mensaje: 'Paciente actualizado correctamente',
                paciente: pacienteActualizado
            }
        );

    } catch (err) {
        res.status(500).json({
            error: 'Error al actualizar al paciente',
            detalle: err.message
        });
    }
};

// 4. CRUD - DELETE
const eliminarPaciente = async (req, res) => {
    try {
        const { id } = req.params;

        const paciente = await obtenerPacientePorId(id);

        await paciente.destroy();

        res.status(200).json(
            {
                mensaje: 'Paciente eliminado exitosamente de la base de datos'
            }
        );

    } catch (err) {
        res.status(500).json(
            {
                error: 'Error al eliminar al paciente',
                detalle: err.message
            }
        );
    }
};


module.exports = {
    crearPaciente,
    leerPacientes,
    actualizarPaciente,
    eliminarPaciente
};