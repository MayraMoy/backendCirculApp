// backend/server.js
require('dotenv').config();
const connectDB = require('./src/config/db');
const app = require('./src/app');

connectDB();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Backend corriendo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Error en el servidor Express:', err);
});