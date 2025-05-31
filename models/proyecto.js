const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Proyecto = sequelize.define('Proyecto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

Proyecto.sync({ force: false })
    .then(() => console.log('Tabla Proyecto sincronizada'))
    .catch((err) => console.error('Error al sincronizar la tabla Proyecto:', err));

module.exports = Proyecto;