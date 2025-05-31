// test/actividadCPM.test.js

const { ValidationError } = require('sequelize');
const ActividadCPM = require('../models/actividadCPM');

// IMPORTAMOS también el objeto `sequelize` para cerrarlo cuando terminemos
const sequelize = require('../models/index');

describe('Modelo ActividadCPM (validaciones de esquema)', () => {
  test('debe fallar: "nombre" no puede ser null', async () => {
    const actividad = ActividadCPM.build({
      duracion: 5.00,
      es_critica: true,
      proyectoId: 1,
      // omito "nombre"
    });

    await expect(actividad.validate()).rejects.toThrow(ValidationError);
  });

  test('debe fallar: "duracion" no puede ser null', async () => {
    const actividad = ActividadCPM.build({
      nombre: 'Actividad A',
      es_critica: false,
      proyectoId: 1,
      // omito "duracion"
    });

    await expect(actividad.validate()).rejects.toThrow(ValidationError);
  });

  test('debe fallar: "es_critica" no puede ser null', async () => {
    const actividad = ActividadCPM.build({
      nombre: 'Actividad B',
      duracion: 3.50,
      proyectoId: 1,
      // omito "es_critica"
    });

    await expect(actividad.validate()).rejects.toThrow(ValidationError);
  });

  test('debe fallar: "proyectoId" no puede ser null', async () => {
    const actividad = ActividadCPM.build({
      nombre: 'Actividad C',
      duracion: 2.75,
      es_critica: true,
      // omito "proyectoId"
    });

    await expect(actividad.validate()).rejects.toThrow(ValidationError);
  });

  test('debe pasar la validación cuando se proporcionan todos los campos obligatorios (y opcionales en formato correcto)', async () => {
    const actividad = ActividadCPM.build({
      nombre: 'Actividad D',
      duracion: 10.50,
      estart: 0.00,
      efinish: 10.50,
      lstart: 1.00,
      lfinish: 11.50,
      htotal: 1.00,
      hlibre: 0.00,
      es_critica: false,
      predecesores: ['ActA', 'ActB'],   // un array válido para JSON
      sucesores: ['ActE'],               // un array válido para JSON
      proyectoId: 42
    });

    // Aquí comprobamos que validate() se resuelva y retorne la instancia
    await expect(actividad.validate()).resolves.toBeInstanceOf(ActividadCPM);

    // Verificaciones adicionales sobre los campos
    expect(actividad.nombre).toBe('Actividad D');
    expect(actividad.duracion).toBeCloseTo(10.50);
    expect(Array.isArray(actividad.predecesores)).toBe(true);
    expect(actividad.predecesores).toEqual(['ActA', 'ActB']);
    expect(Array.isArray(actividad.sucesores)).toBe(true);
    expect(actividad.sucesores).toEqual(['ActE']);
    expect(actividad.es_critica).toBe(false);
    expect(actividad.proyectoId).toBe(42);
  });

  // Si deseas validar que "duracion" no se pase en un formato no numérico,
  // podrías hacerlo guardando la instancia en DB, porque validate() por sí mismo
  // tiende a parsear cadenas numéricas. Por simplicidad, aqui no lo incluimos.
});

afterAll(async () => {
  /**
   * Cerramos la conexión de Sequelize para que Jest no se quede “colgado”
   * esperando conexiones abiertas o intentando imprimir logs luego de las pruebas.
   */
  await sequelize.close();
});
