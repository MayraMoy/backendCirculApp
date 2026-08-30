// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Rutas
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const validationRoutes = require('./routes/validation.routes');
const userRoutes = require('./routes/user.routes');
const locationRoutes = require('./routes/location.routes');
const ratingRoutes = require('./routes/rating.routes');
const adminRoutes = require('./routes/admin.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');
// Middleware
const auth = require('./middleware/auth');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://maps.googleapis.com", "https://res.cloudinary.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (mobile/postman), localhost o dominios de Vercel y FRONTEND_URL
    if (
      !origin || 
      origin === allowedOrigin || 
      origin.startsWith('http://localhost:') || 
      origin.endsWith('.vercel.app') ||
      origin.includes('vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Acceso no permitido por la política CORS.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Límite general para proteger la API contra DoS
app.use('/api/', generalLimiter);

// Rutas con acceso público
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);              // Lectura pública, mutaciones protegidas internamente
app.use('/api/location', locationRoutes);

// Rutas 100% protegidas
app.use('/api/validation', auth, validationRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/ratings', auth, ratingRoutes);
app.use('/api/admin', auth, adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta raíz de healthcheck
app.get('/', (req, res) => {
  res.json({ msg: '🚀 Circulapp Backend está funcionando' });
});

// Middleware 404 para rutas no encontradas (P-012)
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    msg: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    statusCode: 404
  });
});

// Middleware global de manejo de errores (P-011)
app.use(errorHandler);

module.exports = app;