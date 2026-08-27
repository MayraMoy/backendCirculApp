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
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limitNum) || 1;

    const users = await User.find()
      .select('name email role phone location bio active createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.set('X-Total-Count', total.toString());
    res.set('X-Total-Pages', totalPages.toString());
    res.set('X-Current-Page', pageNum.toString());

    if (req.query.format === 'paginated') {
      return res.json({ users, total, page: pageNum, totalPages, limit: limitNum });
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener usuarios.' });
  }
};

// GET /api/admin/items
const getAdminItems = async (req, res) => {
  try {
    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments();
    const totalPages = Math.ceil(total / limitNum) || 1;

    const items = await Item.find()
      .select('title category processingState address createdAt')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.set('X-Total-Count', total.toString());
    res.set('X-Total-Pages', totalPages.toString());
    res.set('X-Current-Page', pageNum.toString());

    if (req.query.format === 'paginated') {
      return res.json({ items, total, page: pageNum, totalPages, limit: limitNum });
    }

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

// GET /api/admin/reports/:type
const getAdminReport = async (req, res) => {
  try {
    const { type } = req.params;
    const now = new Date();

    let reportData = {
      generatedAt: now.toISOString(),
      reportType: type,
      title: `Reporte de ${type.charAt(0).toUpperCase() + type.slice(1)}`
    };

    if (type === 'monthly') {
      const totalUsers = await User.countDocuments();
      const totalItems = await Item.countDocuments();
      const validatedItems = await Item.countDocuments({ processingState: 'validado' });
      const itemsByCategory = await Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      reportData = {
        ...reportData,
        title: 'Reporte Mensual de Actividad - Circulapp',
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        metrics: {
          totalUsers,
          totalItems,
          validatedItems,
          activityRate: totalItems > 0 ? ((validatedItems / totalItems) * 100).toFixed(1) + '%' : '0%'
        },
        itemsByCategory
      };
    } else if (type === 'environmental') {
      const totalItems = await Item.countDocuments();
      const validatedItems = await Item.countDocuments({ processingState: 'validado' });
      const co2SavedKg = totalItems * 10; // Estimación base: 10 kg CO2 por ítem valorizado
      const treesEquivalent = (co2SavedKg / 22).toFixed(1); // 1 árbol absorbe aprox 22kg CO2/año

      const categoryImpact = await Item.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 } } }
      ]);

      reportData = {
        ...reportData,
        title: 'Reporte de Impacto Ambiental - Circulapp',
        metrics: {
          co2SavedKg,
          treesEquivalent,
          totalMaterialsRecycled: totalItems,
          validatedMaterials: validatedItems,
          cleanEnergyScore: 'A+'
        },
        categoryImpact
      };
    } else if (type === 'validations') {
      const validatedItems = await Item.find({ processingState: 'validado' })
        .populate('ownerId', 'name email location')
        .populate('validatedBy', 'name email')
        .select('title category address validationDate validationChecklist validationObservations ownerId validatedBy createdAt');

      reportData = {
        ...reportData,
        title: 'Reporte de Validaciones y Certificaciones Comunales',
        totalValidated: validatedItems.length,
        items: validatedItems
      };
    } else {
      return res.status(400).json({ msg: 'Tipo de reporte no reconocido. Opciones: monthly, environmental, validations.' });
    }

    const filename = `reporte_${type}_${now.toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(reportData);
  } catch (err) {
    console.error('Error al generar reporte administrativo:', err);
    res.status(500).json({ msg: 'Error al generar el reporte administrativo.' });
  }
};

module.exports = {
  getAdminMetrics,
  getAdminUsers,
  getAdminItems,
  promoteUser,
  updateAdminUser,
  getAdminReport
};