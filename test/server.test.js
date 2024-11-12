const request = require('supertest');
const { expect } = require('chai');
const app = require('../server'); // Asegúrate de que exports `app` en `server.js`

describe('Server Routes', () => {
  it('should add a new activity', async () => {
    const res = await request(app)
      .post('/nueva-actividad')
      .send({ nombre: 'A', duracion: 5, predecesores: '' });
    
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message', 'Actividad agregada correctamente');
  });

  it('should calculate activity times', async () => {
    await request(app)
      .post('/nueva-actividad')
      .send({ nombre: 'A', duracion: 5, predecesores: '' });
    
    await request(app)
      .post('/nueva-actividad')
      .send({ nombre: 'B', duracion: 3, predecesores: 'A' });

    const res = await request(app).post('/calcular-tiempos');
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('actividades');
    expect(res.body.actividades).to.be.an('array').that.has.lengthOf(2);
  });
});
