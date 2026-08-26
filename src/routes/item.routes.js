// backend/src/routes/item.routes.js
const express = require('express');
const { createItem, searchItems, updateItem, getItemById, markAsBaled } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload'); // para subir imágenes (opcional en MVP)
const { createItemSchema, updateItemSchema, searchItemsQuerySchema } = require('../validators/item.validator');
const deleteItem = require('../controllers/itemController').deleteItem;
const router = express.Router();
const { exportItemsReport } = require('../controllers/reportController');

// Rutas públicas de lectura de catálogo
router.get('/', validate(searchItemsQuerySchema, 'query'), searchItems);
router.get('/exportar', auth, exportItemsReport);
router.get('/:id', getItemById);

// Rutas protegidas (creación, edición, eliminación y estado)
router.post('/', auth, upload.array('images', 5), validate(createItemSchema), createItem);
router.put('/:id', auth, upload.array('images', 5), validate(updateItemSchema), updateItem);
router.delete('/:id', auth, deleteItem);
router.patch('/:id/bale', auth, markAsBaled);

module.exports = router;