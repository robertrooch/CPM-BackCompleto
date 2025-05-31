const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('calculocpm', 'postgres', 'robert3ro', {
    host: 'localhost',       
    dialect: 'postgres',      
    logging: false,         
});

sequelize.authenticate()
    .then(() => console.log('Conexión a la base de datos establecida correctamente'))
    .catch(err => console.error('No se pudo conectar a la base de datos:', err));

module.exports = sequelize;
