const express = require('express');
const router = express.Router();
const {
    crearTutor,
    leerTutores,
    actualizarTutor,
    eliminarTutor
} = require('../controllers/tutores');

// Operaciones CRUD en la base de datos.

// CREATE - POST
router.post('/', crearTutor);

// READ - GET
router.get('/', leerTutores);

// UPDATE - PUT
router.put('/:id', actualizarTutor);

// DELETE - DELETE
router.delete('/:id', eliminarTutor);


module.exports = router;