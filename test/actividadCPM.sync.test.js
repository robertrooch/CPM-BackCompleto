// test/actividadCPM.sync.test.js

/**
 * En este archivo probamos el bloque de sync() que hay en models/actividadCPM.js:
 *
 *    ActividadCPM.sync({ force: false })
 *      .then(() => console.log('Tabla ActividadCPM sincronizada'))
 *      .catch((err) => console.error('Error al sincronizar la tabla ActividadCPM:', err));
 *
 * Usaremos jest.isolateModules() para que cada importación de 'models/actividadCPM.js'
 * se ejecute con un mock distinto de Sequelize. De esa forma podemos forzar tanto la
 * rama de éxito (resolve) como la rama de error (reject).
 */

describe('Bloque de sync() en models/actividadCPM.js', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Espiamos console.log y console.error para capturar sus llamadas
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Limpiamos el cache de módulos para que isolateModules importe todo fresco
    jest.resetModules();
  });

  afterEach(() => {
    // Restauramos los mocks de console
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('cuando sync() se resuelve, debe llamar a console.log("Tabla ActividadCPM sincronizada")', async () => {
    // 1. Definimos un mock de Sequelize que contiene define() y cuya sync() resuelve
    jest.mock('../models/index', () => {
      // El "define" de Sequelize retorna un "modelo" ficticio con un método sync() que devuelve Promise.resolve()
      return {
        define: jest.fn(() => {
          return {
            sync: () => Promise.resolve() // simulamos éxito en sync()
          };
        }),
        // También mockeamos DataTypes para que no rompa al importar
        DataTypes: { STRING: 'STRING', DECIMAL: 'DECIMAL', BOOLEAN: 'BOOLEAN', JSON: 'JSON', INTEGER: 'INTEGER' }
      };
    });

    // 2. Mockeamos ../models/proyecto (solo es necesario que exista, no importa su contenido)
    jest.mock('../models/proyecto', () => {
      // Retornamos un objeto cualquiera; no se usa aquí
      return { dummy: true };
    });

    // 3. Importamos el módulo dentro de isolateModules (sincrónicamente basta, pues sync().then se dispara tras la importación)
    await jest.isolateModulesAsync(async () => {
      require('../models/actividadCPM');
      // A estas alturas, al importarse, el .sync().then(...) ya se programó
      // Esperamos el siguiente tick para que la promesa de sync() se ejecute
      await new Promise((resolve) => setImmediate(resolve));
    });

    // 4. Verificamos que console.log haya sido llamado con el mensaje exacto
    expect(consoleLogSpy).toHaveBeenCalledWith('Tabla ActividadCPM sincronizada');
    // Y que no se llamó a console.error
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('cuando sync() rechaza, debe llamar a console.error("Error al sincronizar la tabla ActividadCPM:", err)', async () => {
    // 1. Definimos el error que queremos que sync() lance
    const fakeError = new Error('falló la sincronización');

    // 2. Mockeamos Sequelize de modo que define().sync() rechace
    jest.mock('../models/index', () => {
      return {
        define: jest.fn(() => {
          return {
            sync: () => Promise.reject(fakeError) // simulamos fallo en sync()
          };
        }),
        DataTypes: { STRING: 'STRING', DECIMAL: 'DECIMAL', BOOLEAN: 'BOOLEAN', JSON: 'JSON', INTEGER: 'INTEGER' }
      };
    });

    // 3. Mockeamos ../models/proyecto tal cual antes
    jest.mock('../models/proyecto', () => {
      return { dummy: true };
    });

    // 4. Importamos dentro de isolateModules; el .sync() se invocará y su reject() disparará el catch()
    await jest.isolateModulesAsync(async () => {
      require('../models/actividadCPM');
      // Esperamos un tick para que la promesa de sync() rechace y ejecute el catch()
      await new Promise((resolve) => setImmediate(resolve));
    });

    // 5. Verificamos que console.error haya sido llamado con el mensaje y el error esperado
    expect(consoleErrorSpy).toHaveBeenCalled();
    // El primer argumento de console.error debe incluir la cadena exacta 'Error al sincronizar la tabla ActividadCPM:'
    const firstArg = consoleErrorSpy.mock.calls[0][0];
    expect(firstArg).toBe('Error al sincronizar la tabla ActividadCPM:');
    // El segundo argumento de console.error es el propio error que sync() arrojó
    const secondArg = consoleErrorSpy.mock.calls[0][1];
    expect(secondArg).toBe(fakeError);

    // Y verificamos que no se haya llamado console.log
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
