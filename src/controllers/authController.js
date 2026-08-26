// backend/src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: 'El usuario ya existe.'
      });
    }

    user = new User({
      name,
      email,
      password,
      role: 'user' // 🔒 Forzado estrictamente para prevenir escalamiento de privilegios
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
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
    console.error(err);

    res.status(500).json({
      msg: 'Error en el servidor.'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

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
        isDev
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
        isDev: true
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

module.exports = {
  register,
  login,
  devSwitchRole
};