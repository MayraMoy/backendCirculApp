// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Límite para autenticación (Login y Registro) -> 10 intentos cada 15 min con clave compuesta IP + Email
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos por clave
  standardHeaders: true, // Devuelve info en headers RateLimit-*
  legacyHeaders: false, // Deshabilita headers X-RateLimit-*
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const email = req.body?.email && typeof req.body.email === 'string'
      ? req.body.email.toLowerCase().trim()
      : '';
    return email ? `${req.ip}_${email}` : req.ip;
  },
  message: {
    msg: 'Demasiados intentos de autenticación. Por favor espera 15 minutos antes de volver a intentar.'
  }
});

// Límite general para proteger la API contra ataques DoS -> 300 peticiones cada 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: 'Límite de solicitudes alcanzado. Por favor espera unos minutos.'
  }
});

// Límite para geocodificación -> 30 peticiones por minuto
const geocodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: 'Demasiadas consultas de ubicación. Por favor espera un minuto.'
  }
});

module.exports = {
  authLimiter,
  generalLimiter,
  geocodeLimiter
};
