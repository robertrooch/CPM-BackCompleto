// test/proyecto.test.js

/**
 * Primero, creamos un mock para '../models/index' que retorne un Sequelize
 * conectado a SQLite en memoria. Así Proyecto.sync() funcionará sin errores
 * contra Postgres y sin dejar logs tardíos.
 */
jest.mock('../models/index', () => {
  const { Sequelize, DataTypes } = require('sequelize');
  // Creamos un Sequelize que usa SQLite memory y deshabilitamos logs
  return new Sequelize('sqlite::memory:', { logging: false });
});

// Ahora podemos importar Proyecto, que internamente
// hace `sequelize.define(...)` y luego `Proyecto.sync(...)`.
const { ValidationError } = require('sequelize');
const sequelize = require('../models/index'); // Este es el SQLite in-memory
const Proyecto = require('../models/proyecto');

describe('Modelo Proyecto (validaciones de esquema)', () => {
  test('debe fallar si "nombre" es null', async () => {
    // Construimos una instancia omitiendo "nombre"
    const proyecto = Proyecto.build({
      // omitimos nombre
      descripcion: 'Un proyecto de prueba'
    });

    // validate() genera ValidationError si falta algún campo non-nullable
    await expect(proyecto.validate()).rejects.toThrow(ValidationError);
  });

  test('debe pasar la validación cuando "nombre" está presente y "descripcion" es opcional', async () => {
    const proyecto = Proyecto.build({
      nombre: 'Proyecto A',
      // omitimos descripcion porque es allowNull: true
    });

    // Se resuelve con la propia instancia de Proyecto
    await expect(proyecto.validate()).resolves.toBeInstanceOf(Proyecto);

    // Verificamos que el objeto haya guardado correctamente el nombre
    expect(proyecto.nombre).toBe('Proyecto A');
    // Como no proporcionamos descripción, debe quedar `null`
    expect(proyecto.descripcion).toBeNull();
  });

  test('debe aceptar dicha descripción si es una cadena válida', async () => {
    const proyecto = Proyecto.build({
      nombre: 'Proyecto B',
      descripcion: 'Descripción detallada'
    });

    // validate() debe resolverse
    await expect(proyecto.validate()).resolves.toBeInstanceOf(Proyecto);

    expect(proyecto.nombre).toBe('Proyecto B');
    expect(proyecto.descripcion).toBe('Descripción detallada');
  });

  test('debe fallar si "descripcion" no es una cadena (p.ej. un número)', async () => {
    // Sequelize intenta castear múltiples tipos a STRING, pero si pasas un objeto u otro tipo incompatible,
    // puede dispararse un ValidationError. Para forzar un error, pasamos un tipo que no convierta bien.
    const proyecto = Proyecto.build({
      nombre: 'Proyecto C',
      descripcion: { objeto: 'no válido' } // no es string
    });

    await expect(proyecto.validate()).rejects.toThrow(ValidationError);
  });
});

// Cerramos la conexión in-memory para que Jest no quede colgado.
afterAll(async () => {
  await sequelize.close();
});
