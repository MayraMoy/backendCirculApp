// backend/src/controllers/validationController.js
const Item = require('../models/Item');
const notificationService = require('../services/notificationService');

const validateMaterial = async (req, res) => {
  try {
    const { itemId, checklist, observations } = req.body;

    // 1. Verificar rol (Gestor, Admin o Dev)
    const isAuthorized = req.user.role === 'gestor' || req.user.role === 'admin' || req.user.role === 'dev' || req.user.isDev;
    if (!isAuthorized) {
      return res.status(403).json({ msg: 'Solo los gestores y administradores pueden validar materiales.' });
    }

    // 2. Actualización atómica en MongoDB (previene TOCTOU / doble certificación)
    const item = await Item.findOneAndUpdate(
      { _id: itemId, processingState: 'fardado' },
      {
        $set: {
          processingState: 'validado',
          validatedBy: req.user.id,
          validationChecklist: checklist,
          validationObservations: observations || '',
          validationDate: new Date()
        }
      },
      { new: true }
    );

    if (!item) {
      const existing = await Item.findById(itemId);
      if (!existing) return res.status(404).json({ msg: 'Ítem no encontrado.' });
      return res.status(400).json({ 
        msg: `El ítem debe estar en estado "fardado" para validarlo (Estado actual: "${existing.processingState}").` 
      });
    }

    // 5. Emitir notificación de certificación al donante
    const score = checklist?.score || 100;
    notificationService.notifyItemValidated({
      item,
      validatorId: req.user.id,
      checklistScore: score
    }).catch(err => console.error('Error al emitir notificación de validación:', err));

    res.json({ msg: 'Material validado exitosamente.', item: { _id: item._id, processingState: item.processingState } });
  } catch (err) {
    console.error('Error en validateMaterial:', err);
    res.status(500).json({ msg: 'Error al validar el material.' });
  }
};

module.exports = { validateMaterial };