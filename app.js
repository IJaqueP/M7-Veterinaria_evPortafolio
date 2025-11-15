const express = require('express');
const app = express();
const { sequelize } = require('./src/models');
const tutoresRoutes = require('./src/routes/tutores');
const pacientesRoutes = require('./src/routes/pacientes');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/index/tutores', tutoresRoutes);
app.use('/index/pacientes', pacientesRoutes);

app.get('/', (req, res) => {
    res.json(
        {
            mensaje: 'API Veterinaria funcionando'
        }
    );
});

sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos sincronizada');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al sincronizar la base de datos:', err)
    });

module.exports = app;