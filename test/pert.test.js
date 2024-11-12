import { expect } from 'chai';
import Pert from '../services/pert.mjs';

describe('Pert Class', () => {
  let pert;

  beforeEach(() => {
    pert = new Pert();
  });

  it('should add a new activity correctly', () => {
    pert.nuevaActividad('A', 5, '');
    expect(pert.actividades).to.have.lengthOf(1);
    expect(pert.actividades[0]).to.include({ nombre: 'A', duracion: 5 });
  });
});
