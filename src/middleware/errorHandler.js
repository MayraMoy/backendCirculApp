// backend/src/middleware/errorHandler.js

/**
 * Middleware centralizado de manejo global de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log detallado en consola del servidor
  console.error('💥 Error capturado:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // 1. Error de ID de Mongoose (CastError - ej: ID inválido en findById)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'fail',
      msg: `Identificador de recurso inválido para el campo: ${err.path}`,
      statusCode: 400
    });
  }

  // 2. Error de clave duplicada en MongoDB (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(400).json({
      status: 'fail',
      msg: `Ya existe un registro con ese valor en el campo "${field}".`,
      statusCode: 400
    });
  }

  // 3. Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      status: 'fail',
      msg: messages.join('. '),
      errors: messages,
      statusCode: 400
    });
  }

  // 4. Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      msg: 'Token de autenticación inválido o malformado.',
      statusCode: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      msg: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      statusCode: 401
    });
  }

  // 5. Error de Multer (subida de archivos)
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'fail',
      msg: `Error al subir archivo: ${err.message}`,
      statusCode: 400
    });
  }

  // 6. Error general o no controlado
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    msg: err.message || 'Error interno del servidor.',
    statusCode
  });
};

module.exports = errorHandler;
