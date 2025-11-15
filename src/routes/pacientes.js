const express = require('express');
const router = express.Router();
const {
    crearPaciente,
    leerPacientes,
    actualizarPaciente,
    eliminarPaciente
} = require('../controllers/pacientes');

// Operaciones CRUD en la base de datos

// CREATE - POST
router.post('/', crearPaciente);

// READ - GET
router.get('/', leerPacientes);

// UPDATE - PUT
router.put('/:id', actualizarPaciente);

// DELETE - DELETE
router.delete('/:id', eliminarPaciente);

module.exports = router;