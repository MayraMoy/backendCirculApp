// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = typeof req.header === 'function' 
    ? req.header('Authorization') 
    : (req.headers && req.headers.authorization);

  const token = authHeader 
    ? authHeader.replace(/^Bearer\s+/i, '') 
    : null;

  if (!token) {
    return res.status(401).json({ msg: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // P-005: Verificar en base de datos si el usuario fue desactivado o eliminado
    const user = await User.findById(decoded.id).select('_id name email role active isDev');
    if (!user) {
      return res.status(401).json({ msg: 'Usuario no encontrado o sesión inválida.' });
    }

    if (user.active === false) {
      return res.status(403).json({ msg: 'Tu cuenta ha sido desactivada. Comunícate con el administrador.' });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      active: user.active,
      isDev: user.isDev || false,
      name: user.name,
      email: user.email
    };
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token inválido o expirado.' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = typeof req.header === 'function' 
    ? req.header('Authorization') 
    : (req.headers && req.headers.authorization);

  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email role active isDev');
    if (user && user.active !== false) {
      req.user = {
        id: user._id.toString(),
        role: user.role,
        active: user.active,
        isDev: user.isDev || false,
        name: user.name,
        email: user.email
      };
    }
  } catch (err) {
    // Si el token es inválido en modo opcional, se continúa como invitado
  }
  next();
};

module.exports = auth;
module.exports.optionalAuth = optionalAuth;