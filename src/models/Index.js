const sequelize = require('../config/db');
const Accesorio = require('./Accesorio');
const Boleta = require('./Boleta');
const Consulta = require('./Consulta');
const Doctor = require('./Doctor');
const Examen = require('./Examen');
const Medicamento = require('./Medicamento');
const OrdenAccesorio = require('./ordenAccesorio');
const OrdenExamen = require('./ordenExamen');
const OrdenMedica = require('./OrdenMedica');
const OrdenMedicamento = require('./ordenMedicamento');
const Paciente = require('./Paciente');
const Tutor = require('./Tutor');
const Usuario = require('./Usuario');

// Tutor - Paciente (1:N)
Tutor.hasMany(Paciente, {
    foreignKey: 'tutor_id',
    as: 'pacientes',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Paciente.belongsTo(Tutor, {
    foreignKey: 'tutor_id',
    as: 'tutor',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

// Doctor - Consulta (1:N)
Doctor.hasMany(Consulta, {
    foreignKey: 'doctor_id',
    as: 'consultas'
});
Consulta.belongsTo(Doctor, {
    foreignKey: 'doctor_id',
    as: 'doctor'
});

// Paciente - Consulta (1:N)
Paciente.hasMany(Consulta, {
    foreignKey: 'paciente_id',
    as: 'consultas'
});
Consulta.belongsTo(Paciente, {
    foreignKey: 'paciente_id',
    as: 'paciente'
});

// Consulta - OrdenMedica (1:N)
Consulta.hasMany(OrdenMedica, {
    foreignKey: 'consulta_id',
    as: 'ordenMedica'
});
OrdenMedica.belongsTo(Consulta, {
    foreignKey: 'consulta_id',
    as: 'consulta'
});

// Consulta - Boleta (1:1)
Consulta.hasOne(Boleta, {
    foreignKey: 'consulta_id',
    as: 'boleta'
});
Boleta.belongsTo(Consulta, {
    foreignKey: 'consulta_id',
    as: 'consulta'
});

// OrdenMedica - Medicamento (N:M)
OrdenMedica.belongsToMany(Medicamento, {
    through: OrdenMedicamento,
    foreignKey: 'orden_id',
    as: 'medicamentos'
});
Medicamento.belongsToMany(OrdenMedica, {
    through: OrdenMedicamento,
    foreignKey: 'medicamento_id',
    as: 'ordenes'
});

// OrdenMedica - Examen (N:M)
OrdenMedica.belongsToMany(Examen, {
    through: OrdenExamen,
    foreignKey: 'orden_id',
    as: 'examenes'
});
Examen.belongsToMany(OrdenMedica, {
    through: OrdenExamen,
    foreignKey: 'examen_id',
    as: 'ordenes'
});

// OrdenMedica - Accesorio (N:M)
OrdenMedica.belongsToMany(Accesorio, {
    through: OrdenAccesorio,
    foreignKey: 'orden_id',
    as: 'accesorios'
});
Accesorio.belongsToMany(OrdenMedica, {
    through: OrdenAccesorio,
    foreignKey: 'accesorio_id',
    as: 'ordenes'
});

module.exports = {
    sequelize,
    Accesorio,
    Boleta,
    Consulta,
    Doctor,
    Examen,
    Medicamento,
    OrdenAccesorio,
    OrdenExamen,
    OrdenMedica,
    OrdenMedicamento,
    Paciente,
    Tutor,
    Usuario
};