// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  const validRoles = ['user', 'gestor', 'coordinador', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: 'Rol no permitido.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe.' });

    user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // ✅ Incluir TODOS los campos del usuario (incluyendo phone, location, bio)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales incorrectas.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales incorrectas.' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // ✅ Incluir TODOS los campos del usuario (incluyendo phone, location, bio)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

module.exports = { register, login };