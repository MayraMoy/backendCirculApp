// backend/src/controllers/adminController.js
const User = require('../models/User');
const Item = require('../models/Item');

// GET /api/admin/metrics
const getAdminMetrics = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const validatedItems = await Item.countDocuments({ processingState: 'validado' });
    const totalUsers = await User.countDocuments();
    const activeGestores = await User.countDocuments({ role: 'gestor', active: true });

    // Simulación de CO2 y tasa (en MVP real, calcula con datos reales)
    const co2Saved = totalItems * 10; // 10 kg por ítem
    const recyclingRate = totalItems > 0 ? Math.round((validatedItems / totalItems) * 100) : 0;

    res.json({
      totalItems,
      validatedItems,
      co2Saved,
      recyclingRate,
      totalUsers,
      activeGestores
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener métricas.' });
  }
};

// GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role phone location bio active createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener usuarios.' });
  }
};

// GET /api/admin/items
const getAdminItems = async (req, res) => {
  try {
    const items = await Item.find()
      .select('title category processingState address createdAt')
      .populate('ownerId', 'name email phone');
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener ítems.' });
  }
};

// POST /api/admin/users/:id/promote
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
    
    const targetRole = req.body.role || (user.role === 'user' ? 'gestor' : user.role);
    if (!['user', 'gestor', 'admin'].includes(targetRole)) {
      return res.status(400).json({ msg: 'Rol no permitido para asignación administrativa.' });
    }
    user.role = targetRole;
    await user.save();
    res.json({ msg: `Rol del usuario actualizado a ${user.role}.`, user });
  } catch (err) {
    res.status(500).json({ msg: 'Error al cambiar rol del usuario.' });
  }
};

// PUT /api/admin/users/:id
const updateAdminUser = async (req, res) => {
  try {
    const { name, phone, role, location, active } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined && ['user', 'gestor', 'admin'].includes(role)) {
      updateData.role = role;
    }
    if (location !== undefined) updateData.location = location;
    if (active !== undefined) updateData.active = active;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('name email role phone location bio active createdAt');

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Error al actualizar usuario.' });
  }
};

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  getAdminItems,
  promoteUser,
  updateAdminUser
};