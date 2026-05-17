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

const app = express();

app.use(helmet());
app.use(cors());

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/items', auth, itemRoutes);          // auth aplicado aquí
app.use('/api/validation', auth, validationRoutes); // auth aquí también (mejor que en el controlador)
app.use('/api/users', auth, userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/ratings', auth, ratingRoutes);
app.use('/api/admin', auth, adminRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ msg: '🚀 Circulapp Backend está funcionando' });
});

module.exports = app;