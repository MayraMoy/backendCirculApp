// backend/src/controllers/reportModerationController.js
const Report = require('../models/Report');
const Item = require('../models/Item');
const { deleteFromCloudinary } = require('../utils/cloudinary');

// Crear una denuncia (Cualquier usuario autenticado)
const createReport = async (req, res) => {
  try {
    const { itemId, reason, description } = req.body;
    const reporterId = req.user.id;

    // Verificar que el material exista
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: 'El material a denunciar no existe o ya fue eliminado.' });
    }

    // Evitar autodenuncias
    if (item.ownerId.toString() === reporterId) {
      return res.status(400).json({ msg: 'No puedes denunciar tu propia publicación.' });
    }

    // Evitar duplicados pendientes del mismo usuario
    const existing = await Report.findOne({
      item: itemId,
      reporter: reporterId,
      status: { $in: ['pendiente', 'en_revision'] }
    });

    if (existing) {
      return res.status(400).json({ msg: 'Ya has enviado una denuncia para esta publicación. Nuestro equipo la está revisando.' });
    }

    const report = new Report({
      item: itemId,
      reporter: reporterId,
      reason,
      description: description || ''
    });

    await report.save();

    res.status(201).json({
      msg: 'Denuncia enviada correctamente. Gracias por colaborar con la comunidad.',
      report
    });
  } catch (err) {
    console.error('Error en createReport:', err);
    res.status(500).json({ msg: 'Error al procesar la denuncia.' });
  }
};

// Listar denuncias (Solo Admin y Gestor)
const getReports = async (req, res) => {
  try {
    const isStaff = ['admin', 'gestor', 'dev'].includes(req.user.role) || req.user.isDev;
    if (!isStaff) {
      return res.status(403).json({ msg: 'Acceso restringido a administradores y gestores.' });
    }

    const { status } = req.query;
    const filter = {};
    if (status && ['pendiente', 'en_revision', 'desestimada', 'publicacion_eliminada'].includes(status)) {
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('item', 'title category images processingState address location ownerId')
      .populate('reporter', 'name email')
      .populate('resolvedBy', 'name email');

    const pendingCount = await Report.countDocuments({ status: 'pendiente' });

    res.json({
      reports,
      pendingCount,
      total: reports.length
    });
  } catch (err) {
    console.error('Error en getReports:', err);
    res.status(500).json({ msg: 'Error al obtener las denuncias.' });
  }
};

// Desestimar denuncia (Solo Admin y Gestor)
const dismissReport = async (req, res) => {
  try {
    const isStaff = ['admin', 'gestor', 'dev'].includes(req.user.role) || req.user.isDev;
    if (!isStaff) {
      return res.status(403).json({ msg: 'Acceso restringido a administradores y gestores.' });
    }

    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ msg: 'Denuncia no encontrada.' });
    }

    report.status = 'desestimada';
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;

    await report.save();

    res.json({
      msg: 'Denuncia desestimada correctamente.',
      report
    });
  } catch (err) {
    console.error('Error en dismissReport:', err);
    res.status(500).json({ msg: 'Error al desestimar la denuncia.' });
  }
};

// Eliminar publicación denunciada y resolver denuncias asociadas (Solo Admin y Gestor)
const deleteReportedItem = async (req, res) => {
  try {
    const isStaff = ['admin', 'gestor', 'dev'].includes(req.user.role) || req.user.isDev;
    if (!isStaff) {
      return res.status(403).json({ msg: 'Acceso restringido a administradores y gestores.' });
    }

    const { id } = req.params; // ID de la denuncia
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ msg: 'Denuncia no encontrada.' });
    }

    const item = await Item.findById(report.item);
    if (item) {
      // Borrar fotos de Cloudinary
      if (item.images && item.images.length > 0) {
        deleteFromCloudinary(item.images).catch(err => console.warn('Error borrando fotos en Cloudinary:', err.message));
      }
      // Borrar ítem de la BD
      await Item.findByIdAndDelete(item._id);
    }

    // Actualizar todas las denuncias abiertas sobre este ítem
    await Report.updateMany(
      { item: report.item },
      {
        $set: {
          status: 'publicacion_eliminada',
          resolvedBy: req.user.id,
          resolvedAt: new Date(),
          resolutionNotes: req.body.resolutionNotes || 'Publicación eliminada por moderación tras denuncia.'
        }
      }
    );

    res.json({
      msg: 'Publicación infractora eliminada y denuncias resueltas exitosamente.'
    });
  } catch (err) {
    console.error('Error en deleteReportedItem:', err);
    res.status(500).json({ msg: 'Error al eliminar la publicación denunciada.' });
  }
};

module.exports = {
  createReport,
  getReports,
  dismissReport,
  deleteReportedItem
};
