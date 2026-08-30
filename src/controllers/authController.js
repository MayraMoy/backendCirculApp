// backend/src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail
} = require('../services/emailService');

const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      return res.status(400).json({
        msg: 'El correo electrónico ya se encuentra registrado. Por favor inicia sesión o utiliza otro correo.'
      });
    }

    user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'user' // 🔒 Forzado estrictamente para prevenir escalamiento de privilegios
    });

    await user.save();

    // Despachar email de bienvenida en segundo plano
    sendWelcomeEmail(user);

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        jti: crypto.randomUUID()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      }
    });

  } catch (err) {
    next(err);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const sanitizedEmail = email ? email.toLowerCase().trim() : '';
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user) {
      return res.status(400).json({
        msg: 'Credenciales incorrectas.'
      });
    }

    // Bloquear usuarios desactivados
    if (user.active === false) {
      return res.status(403).json({
        msg: 'Tu cuenta ha sido desactivada. Contacta con un administrador.'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: 'Credenciales incorrectas.'
      });
    }

    const isDev = user.role === 'dev' || user.isDev === true;
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        isDev,
        jti: crypto.randomUUID()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role === 'dev' ? 'admin' : user.role,
        isDev,
        active: user.active,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: 'Error en el servidor.'
    });
  }
};

const devSwitchRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isDev = user && (user.role === 'dev' || user.isDev === true || req.user.isDev === true);
    if (!isDev) {
      return res.status(403).json({ msg: 'Solo los usuarios con rol DEV en la base de datos pueden usar esta función.' });
    }

    const { newRole } = req.body;
    if (!['user', 'gestor', 'admin'].includes(newRole)) {
      return res.status(400).json({ msg: 'Rol no válido.' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: newRole,
        isDev: true,
        jti: crypto.randomUUID()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: newRole,
        isDev: true,
        active: user.active,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      }
    });
  } catch (err) {
    console.error('Error en devSwitchRole:', err);
    res.status(500).json({ msg: 'Error al cambiar rol en el servidor.' });
  }
};

/**
 * Solicitar recuperación de contraseña (POST /api/auth/forgot-password)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        msg: 'Si el correo electrónico está registrado, recibirás un enlace de recuperación en los próximos minutos.'
      });
    }

    // 1. Generar token criptográfico único
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hashear y guardar en BD con expiración de 15 minutos
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 3. Enviar correo de recuperación
    await sendResetPasswordEmail(user, resetToken);

    res.json({
      msg: 'Correo de recuperación enviado con éxito. Por favor revisa tu bandeja de entrada o spam.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Restablecer contraseña con token (POST /api/auth/reset-password/:token)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Hashear el token de la URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        msg: 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'
      });
    }

    // 3. Actualizar contraseña (el pre-save de mongoose la hashea con bcrypt)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now() - 1000;
    await user.save();

    // 4. Notificar por correo
    sendPasswordChangedEmail(user);

    res.json({
      msg: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  devSwitchRole,
  forgotPassword,
  resetPassword
};