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
// Middleware
const auth = require('./middleware/auth');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());

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