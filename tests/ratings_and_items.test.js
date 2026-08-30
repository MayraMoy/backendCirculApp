const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

describe('Suite de Integración: Items, Calificaciones y Control de Acceso (Backend)', () => {

  let testUser;
  let testToken;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Crear usuario temporal para pruebas autenticadas
    testUser = await User.findOneAndUpdate(
      { email: 'test_integration_qa@circulapp.com' },
      {
        name: 'Usuario QA Integration',
        email: 'test_integration_qa@circulapp.com',
        password: 'Password123!',
        role: 'user',
        active: true
      },
      { upsert: true, new: true }
    );

    testToken = jwt.sign(
      { id: testUser._id.toString(), email: testUser.email, role: testUser.role, jti: 'test-jti-qa' },
      process.env.JWT_SECRET || 'circulapp_super_secret_jwt_key_2026'
    );
  });

  after(async () => {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/items - Debe retornar listado público de materiales con código 200 o array', async () => {
    const res = await request(app)
      .get('/api/items')
      .expect(200);

    assert.ok(Array.isArray(res.body), 'La respuesta debe ser un array de materiales');
  });

  it('GET /api/items/invalid_id_123 - Debe capturar CastError y responder 400 de forma controlada', async () => {
    const res = await request(app)
      .get('/api/items/id_invalido_de_prueba')
      .expect(400);

    assert.ok(res.body.msg || res.body.status === 'fail', 'Debe retornar mensaje de identificador inválido');
  });

  it('POST /api/ratings - Debe rechazar creación de calificación sin token JWT (401)', async () => {
    const res = await request(app)
      .post('/api/ratings')
      .send({
        itemId: '60c72b2f9b1d8b2bad000001',
        materialQuality: 5,
        comment: 'Excelente material'
      })
      .expect(401);

    assert.strictEqual(res.status, 401);
  });

  it('GET /api/ratings/user/id_invalido - Debe rechazar identificador de usuario inválido con 400 cuando está autenticado', async () => {
    const res = await request(app)
      .get('/api/ratings/user/formato_invalido')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(400);

    assert.strictEqual(res.status, 400);
    assert.match(res.body.msg, /inválido/i);
  });

  it('GET /api/reports - Debe denegar acceso a la lista de denuncias sin autorización (401)', async () => {
    const res = await request(app)
      .get('/api/reports')
      .expect(401);

    assert.strictEqual(res.status, 401);
  });

  it('GET /api/admin/metrics - Debe proteger métricas administrativas contra accesos anónimos (401)', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .expect(401);

    assert.strictEqual(res.status, 401);
  });

});
