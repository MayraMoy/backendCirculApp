// backend/src/controllers/validationController.js
const Item = require('../models/Item');

const validateMaterial = async (req, res) => {
  try {
    const { itemId, checklist, observations } = req.body;

    // 1. Verificar rol
    if (req.user.role !== 'gestor') {
      return res.status(403).json({ msg: 'Solo los gestores pueden validar materiales.' });
    }

    // 2. Validar ítem
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado.' });

    // 3. Verificar estado
    if (item.processingState !== 'fardado') {
      return res.status(400).json({ msg: 'El ítem debe estar en estado "fardado" para validarlo.' });
    }

    // 4. Validar checklist
    const requiredChecks = ['limpieza', 'homogeneidad', 'compactado', 'etiquetado'];
    if (!checklist || !Array.isArray(checklist) || checklist.length !== 4) {
      return res.status(400).json({ msg: 'Checklist incompleto. Debe contener 4 ítems.' });
    }

    const missing = requiredChecks.filter(item => !checklist.includes(item));
    if (missing.length > 0) {
      return res.status(400).json({ msg: `Faltan ítems en el checklist: ${missing.join(', ')}` });
    }

    // 5. Actualizar ítem
    item.processingState = 'validado';
    item.validatedBy = req.user.id;
    item.validationChecklist = checklist;
    item.validationObservations = observations || '';
    item.validationDate = new Date();
    await item.save();

    res.json({ msg: 'Material validado exitosamente.', item: { _id: item._id, processingState: item.processingState } });
  } catch (err) {
    console.error('Error en validateMaterial:', err);
    res.status(500).json({ msg: 'Error al validar el material.' });
  }
};

module.exports = { validateMaterial };