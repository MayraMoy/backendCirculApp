// backend/src/controllers/itemController.js
const Item = require('../models/Item');
const User = require('../models/User');

// Crear un nuevo ítem (RF03)
const createItem = async (req, res) => {
  try {
    const { title, description, category, lat, lng, address } = req.body;

    // Convertir y validar coordenadas
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ msg: 'Latitud y longitud deben ser números válidos.' });
    }

    // Subir imágenes (si usas CloudinaryStorage, req.files ya tiene URLs)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path || file.url);
    }

    const newItem = new Item({
      title,
      description,
      category,
      location: { lat: latNum, lng: lngNum },
      address: address || '',
      ownerId: req.user.id,
      images: imageUrls,
      processingState: 'sin_procesar' // Estado inicial
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error en createItem:', err);
    res.status(500).json({ msg: 'Error al crear el ítem.' });
  }
};

// Buscar ítems con filtros avanzados (RF04, RF13)
const searchItems = async (req, res) => {
  try {
    const { 
      query, 
      category, 
      processingState, 
      lat, 
      lng, 
      radius,
      ownerId 
    } = req.query;

    let filter = {};

    // Filtro por dueño (para perfil de usuario)
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    // Filtro por estado de procesamiento (RF15)
    if (processingState) {
      filter.processingState = processingState;
    }

    // Búsqueda por texto
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (category) filter.category = category;

    // Obtener ítems
    let items = await Item.find(filter).populate('ownerId', 'name email');

    // Filtrado por proximidad (opcional)
    if (lat && lng && radius) {
      const earthRadiusKm = 6371;
      const maxDistance = parseFloat(radius);
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(maxDistance)) {
        items = items.filter(item => {
          const dx = (item.location.lat - latNum) * earthRadiusKm * Math.PI / 180;
          const dy = (item.location.lng - lngNum) * earthRadiusKm * Math.PI / 180 * Math.cos(latNum * Math.PI / 180);
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= maxDistance;
        });
      }
    }

    res.json(items);
  } catch (err) {
    console.error('Error en searchItems:', err);
    res.status(500).json({ msg: 'Error al buscar ítems.' });
  }
};

// Obtener un ítem por ID
// backend/src/controllers/itemController.js
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('ownerId', 'name email phone'); // ← ¡incluye 'phone' aquí!
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener el ítem.' });
  }
};

// Eliminar un ítem (solo dueño o admin)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado.' });

    if (item.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tienes permiso para eliminar este ítem.' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Publicación eliminada.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar el ítem.' });
  }
};

const markAsBaled = async (req, res) => {
  try {
    // Verificar rol
    if (req.user.role !== 'gestor') {
      return res.status(403).json({ msg: 'Solo los gestores pueden marcar materiales como fardados.' });
    }

    const { id } = req.params;

    // Buscar ítem
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado.' });

    // Verificar que el ítem esté en un estado que permita fardado
    if (!['sin_procesar', 'en_proceso'].includes(item.processingState)) {
      return res.status(400).json({ 
        msg: `El ítem ya está en estado "${item.processingState}". Solo se puede fardar desde "sin_procesar" o "en_proceso".` 
      });
    }

    // Actualizar estado
    item.processingState = 'fardado';
    await item.save();

    res.json({ 
      msg: 'Material marcado como fardado exitosamente.', 
      item: { _id: item._id, processingState: item.processingState } 
    });
  } catch (err) {
    console.error('Error en markAsBaled:', err);
    res.status(500).json({ msg: 'Error al marcar el material como fardado.' });
  }
};

module.exports = { createItem, searchItems, getItemById, deleteItem, markAsBaled };