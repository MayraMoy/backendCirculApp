// backend/src/routes/item.routes.js
const express = require('express');
const { createItem, searchItems, updateItem, getItemById, markAsBaled } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // para subir imágenes (opcional en MVP)
const deleteItem = require('../controllers/itemController').deleteItem;
const router = express.Router();
const { exportItemsReport } = require('../controllers/reportController');

router.post('/', auth, upload.array('images', 5), createItem);
router.get('/', auth, searchItems);
router.get('/exportar', auth, exportItemsReport);
router.get('/:id', auth, getItemById);
router.put('/:id', auth, upload.array('images', 5), updateItem);
router.delete('/:id', auth, deleteItem);
router.patch('/:id/bale', auth, markAsBaled);

module.exports = router;