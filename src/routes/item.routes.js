// backend/src/routes/item.routes.js
const express = require('express');
const { createItem, searchItems, getItemById, markAsBaled } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // para subir imágenes (opcional en MVP)
const deleteItem = require('../controllers/itemController').deleteItem;
const router = express.Router();

/**
 * @route   POST /api/items
 * @desc    Crear una nueva publicación de material (RF03)
 * @access  Privado (cualquier usuario autenticado)
 */
router.post('/', auth, upload.array('images', 5), createItem);

/**
 * @route   GET /api/items
 * @desc    Buscar ítems con filtros avanzados (RF04 + RF13)
 * @query   ?query=...&category=...&processingState=...&lat=...&lng=...&radius=...
 * @access  Privado
 */
router.get('/', auth, searchItems);

/**
 * @route   GET /api/items/:id
 * @desc    Obtener un ítem por ID
 * @access  Privado
 */
router.get('/:id', auth, getItemById);

router.delete('/:id', auth, deleteItem);

router.patch('/:id/bale', auth, markAsBaled);

module.exports = router;