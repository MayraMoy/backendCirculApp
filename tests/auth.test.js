const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');

describe('Suite de Pruebas de Seguridad y Autenticación (Backend)', () => {

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB().catch(err => console.warn('Nota: Base de datos no conectada en tests:', err.message));
    }
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('Debe incluir cabeceras de seguridad Helmet y CSP en respuestas', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.headers['content-security-policy'], 'Falta Content-Security-Policy');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  it('Debe rechazar registro si la contraseña tiene menos de 8 caracteres (Zod Validator)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario Test',
        email: 'test@example.com',
        password: '123'
      });

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.errors || res.body.msg, 'Debe devolver detalle de error de validación');
  });

  it('Debe rechazar registro si la contraseña no contiene números', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario Test',
        email: 'test@example.com',
        password: 'sololetrasmayus'
      });

    assert.strictEqual(res.statusCode, 400);
  });

  it('Debe rechazar login con cuerpo vacío o email inválido', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'no-es-un-email',
        password: ''
      });

    assert.strictEqual(res.statusCode, 400);
  });

  it('Debe denegar acceso a rutas protegidas si no se provee Authorization Bearer Token', async () => {
    const res = await request(app).get('/api/notifications');
    assert.strictEqual(res.statusCode, 401);
    assert.ok(res.body.msg.includes('Acceso denegado') || res.body.msg.includes('Token no proporcionado'));
  });

  it('Debe denegar acceso si el token JWT es inválido o corrupto', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer token_invalido_xyz123');

    assert.strictEqual(res.statusCode, 401);
  });

  it('Debe rechazar solicitud de recuperación de contraseña si el formato de email es inválido', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'formato-invalido-email' });

    assert.strictEqual(res.statusCode, 400);
  });

});
