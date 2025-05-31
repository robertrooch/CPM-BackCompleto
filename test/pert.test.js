// test/pert.test.js

// IMPORTACIÓN DE LA CLASE Pert (solo UNA vez)
const Pert = require('../services/pert.js');

describe('Clase Pert', () => {
  let pert;

  beforeEach(() => {
    // Cada test arranca con una instancia nueva
    pert = new Pert();
  });

  test('nuevaActividad debe crear una actividad con la duración calculada correctamente', () => {
    // 1. Crea la actividad "A" sin predecesores
    pert.nuevaActividad('A', '1', '2', '3', '');
    const actA = pert.locateRect('A');

    // Fórmula: (1 + 4*2 + 3) / 6 = 12/6 = 2
    expect(actA.duracion).toBeCloseTo(2);

    // Verifica id, nombre y arrays vacíos
    expect(actA.id).toBe(1);
    expect(actA.nombre).toBe('A');
    expect(Array.isArray(actA.sucesores)).toBe(true);
    expect(actA.sucesores.length).toBe(0);
    expect(actA.predecesores).toEqual(['']); 
  });

  test('nuevaActividad lanza error si la actividad es predecesora de sí misma', () => {
    expect(() => {
      pert.nuevaActividad('X', '2', '3', '4', 'X');
    }).toThrowError(`La actividad X no puede ser predecesora de sí misma`);
  });

  test('generarDiagrama calcula estart y efinish para una cadena simple de dependencias', () => {
    // Actividad A (duración ≈ (1+4*2+5)/6 = 14/6 ≈ 2.3333)
    pert.nuevaActividad('A', '1', '2', '5', '');

    // Actividad B depende de A (duración ≈ (2+4*2+6)/6 = 16/6 ≈ 2.6667)
    pert.nuevaActividad('B', '2', '2', '6', 'A');

    // Actividad C depende de B (duración = (3 + 4*3 + 9)/6 = 24/6 = 4)
    pert.nuevaActividad('C', '3', '3', '9', 'B');

    // Genera el diagrama completo (early y late)
    pert.generarDiagrama();

    const actA = pert.locateRect('A');
    const actB = pert.locateRect('B');
    const actC = pert.locateRect('C');

    // ——— COMPROBACIONES PARA A ———
    expect(actA.estart).toBeCloseTo(0);
    expect(actA.efinish).toBeCloseTo((1 + 4 * 2 + 5) / 6);

    // ——— COMPROBACIONES PARA B ———
    expect(actB.estart).toBeCloseTo(actA.efinish);
    expect(actB.efinish).toBeCloseTo(actA.efinish + (2 + 4 * 2 + 6) / 6);

    // ——— COMPROBACIONES PARA C ———
    expect(actC.estart).toBeCloseTo(actB.efinish);
    expect(actC.efinish).toBeCloseTo(actB.efinish + (3 + 4 * 3 + 9) / 6);

    // Ahora comprobamos late finish/start
    const tiempoFinal = actC.efinish;
    // C no tiene sucesores → lfinish_C = tiempoFinal
    expect(actC.lfinish).toBeCloseTo(tiempoFinal);
    expect(actC.lstart).toBeCloseTo(tiempoFinal - actC.duracion);

    // B su sucesor es C → lfinish_B = lstart_C
    expect(actB.lfinish).toBeCloseTo(actC.lstart);
    expect(actB.lstart).toBeCloseTo(actB.lfinish - actB.duracion);

    // A su sucesor es B → lfinish_A = lstart_B
    expect(actA.lfinish).toBeCloseTo(actB.lstart);
    expect(actA.lstart).toBeCloseTo(actA.lfinish - actA.duracion);

    // Verifica niveles y que no haya inconsistencia
    [actA, actB, actC].forEach((act) => {
      expect(act.nivel).toBeGreaterThan(0);
      expect(act.efinish).toBeGreaterThanOrEqual(act.estart);
      expect(act.lfinish).toBeGreaterThanOrEqual(act.lstart);
    });
  });

  test('eliminarActividad debe remover correctamente una actividad existente', () => {
    pert.nuevaActividad('A', '1', '1', '1', '');
    pert.nuevaActividad('B', '2', '2', '2', 'A');

    expect(pert.actividades.length).toBe(2);

    // Elimina A (id=1)
    pert.eliminarActividad(1);

    expect(pert.actividades.length).toBe(1);
    expect(pert.actividades[0].nombre).toBe('B');
  });

  test('limpiarActividades debe resetear al estado inicial', () => {
    pert.nuevaActividad('X', '1', '1', '1', '');
    expect(pert.actividades.length).toBe(1);
    expect(pert.idActividad).toBe(1);

    pert.limpiarActividades();

    expect(pert.actividades.length).toBe(0);
    expect(pert.idActividad).toBe(0);
  });
});
