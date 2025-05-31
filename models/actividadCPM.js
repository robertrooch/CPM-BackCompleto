const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Proyecto = require('./proyecto');

const ActividadCPM = sequelize.define('ActividadCPM', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duracion: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    estart: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    efinish: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    lstart: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    lfinish: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    htotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    hlibre: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    es_critica: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    predecesores: {
        type: DataTypes.JSON,
        allowNull: true
    },
    sucesores: {
        type: DataTypes.JSON,
        allowNull: true
    },
    proyectoId: { 
        type: DataTypes.INTEGER,
        references: {
            model: Proyecto,
            key: 'id'
        },
        allowNull: false
    }
});
        
ActividadCPM.sync({ force: false })
    .then(() => console.log('Tabla ActividadCPM sincronizada'))
    .catch((err) => console.error('Error al sincronizar la tabla ActividadCPM:', err));

module.exports = ActividadCPM;
