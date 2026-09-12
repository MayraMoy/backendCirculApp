const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

describe('Suite de Pruebas: Puntos de Reciclaje y Geocodificación (Backend)', () => {

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB().catch(err => console.warn('Nota: DB no conectada en tests:', err.message));
    }
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/recycling-points - Debe responder 200 y devolver un array público', async () => {
    const res = await request(app).get('/api/recycling-points');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body), 'La respuesta debe ser una lista de puntos de reciclaje');
  });

  it('POST /api/recycling-points - Debe rechazar creación sin token de autenticación (401)', async () => {
    const res = await request(app)
      .post('/api/recycling-points')
      .send({
        name: 'Punto Limpio Norte',
        address: 'Av. Libertador 1000',
        lat: -34.6037,
        lng: -58.3816
      });
    assert.strictEqual(res.statusCode, 401);
  });

  it('GET /api/location/geocode - Debe requerir token de autenticación (401)', async () => {
    const res = await request(app).get('/api/location/geocode?address=Obelisco');
    assert.strictEqual(res.statusCode, 401);
  });

  it('GET /api/recycling-points/:id - Debe devolver 400 ante un ID inválido', async () => {
    const res = await request(app).get('/api/recycling-points/id_invalido_test');
    assert.strictEqual(res.statusCode, 400);
  });

});
