// test/index.test.js

/**
 * Pruebas para el módulo `models/index.js`, que exporta una instancia de Sequelize
 * y llama a `authenticate()` en el momento de importarse.
 *
 * Ejecutamos dos escenarios:
 *  1) Cuando `authenticate()` resuelve sin errores: esperamos que se llame a console.log.
 *  2) Cuando `authenticate()` rechaza: esperamos que se llame a console.error con el mensaje de error.
 *
 * Para lograrlo, mockeamos el paquete `sequelize` antes de importar `models/index.js`,
 * de modo que podamos controlar el comportamiento de `authenticate()`.
 */

const ORIGINAL_ENV = process.env.NODE_ENV;

describe('Módulo Sequelize (models/index.js)', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Reemplazamos console.log y console.error por spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restauramos los spies y variables de entorno
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.resetModules(); // para limpiar el cache de require y poder mockear de nuevo
    process.env.NODE_ENV = ORIGINAL_ENV;
  });

  test('debe llamar a console.log si authenticate() resuelve correctamente', async () => {
    // 1) Forzamos NODE_ENV distinto de "test" para que se ejecute authenticate()
    process.env.NODE_ENV = 'development';

    // 2) Mockeamos el paquete 'sequelize' para que authenticate devuelva Promise.resolve()
    jest.mock('sequelize', () => {
      return {
        Sequelize: jest.fn().mockImplementation(() => {
          return {
            authenticate: () => Promise.resolve(), // simula conexión exitosa
          };
        }),
      };
    });

    // 3) Importamos el módulo. Al importarse, ejecutará sequelize.authenticate().
    const sequelize = require('../models/index');

    // 4) Esperamos a que la promesa interna de authenticate() se resuelva.
    await new Promise((resolve) => setImmediate(resolve));

    // 5) Verificamos que se llamó a console.log con el mensaje esperado
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Conexión a la base de datos establecida correctamente'
    );

    // 6) No debe haberse llamado a console.error
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // 7) Verificamos que el objeto exportado sea la instancia derivada de nuestro mock
    const { Sequelize: MockSequelize } = require('sequelize');
    expect(sequelize).toBeInstanceOf(MockSequelize);
  });

  test('debe llamar a console.error si authenticate() rechaza', async () => {
    process.env.NODE_ENV = 'development';

    // 1) Mockeamos 'sequelize' para que authenticate devuelva Promise.reject()
    jest.mock('sequelize', () => {
      return {
        Sequelize: jest.fn().mockImplementation(() => {
          return {
            authenticate: () => Promise.reject(new Error('falló la conexión')),
          };
        }),
      };
    });

    // 2) Importamos el módulo; authenticate() producirá un rechazo
    require('../models/index');

    // 3) Esperamos al siguiente tick para que .catch(...) tenga oportunidad de ejecutarse
    await new Promise((resolve) => setImmediate(resolve));

    // 4) Verificamos que console.error se haya llamado con mensaje que contiene 'No se pudo conectar a la base de datos'
    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorArg = consoleErrorSpy.mock.calls[0][0];
    expect(errorArg).toMatch(/No se pudo conectar a la base de datos:/);

    // 5) console.log no debe haberse llamado
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  test('no debe invocar authenticate() cuando NODE_ENV === "test"', () => {
    process.env.NODE_ENV = 'test';

    // 1) Mockeamos Sequelize, pero authenticate no debería llamarse
    const mockAuthenticate = jest.fn();
    jest.mock('sequelize', () => {
      return {
        Sequelize: jest.fn().mockImplementation(() => {
          return { authenticate: mockAuthenticate };
        }),
      };
    });

    // 2) Importamos el módulo; dado que NODE_ENV === 'test', el bloque `if` evitará llamar a authenticate()
    const sequelize = require('../models/index');

    // 3) authenticate() NO debe haber sido invocado
    expect(mockAuthenticate).not.toHaveBeenCalled();

    // 4) El objeto exportado sigue siendo la instancia de Sequelize mockeada
    const { Sequelize: MockSequelize } = require('sequelize');
    expect(sequelize).toBeInstanceOf(MockSequelize);
  });
});
