// backend/src/controllers/recyclingPointController.js
const RecyclingPoint = require('../models/RecyclingPoint');

// Obtener todos los puntos de reciclaje con filtros opcionales
const getRecyclingPoints = async (req, res) => {
  try {
    const { status, category, search, lat, lng, maxDistance } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.acceptedCategories = category;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { description: searchRegex }
      ];
    }

    // Búsqueda por cercanía geoespacial si se proporcionan coordenadas
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const maxDistMeters = maxDistance ? parseInt(maxDistance, 10) : 50000; // 50km por defecto
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: maxDistMeters
        }
      };
    }

    const points = await RecyclingPoint.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(points);
  } catch (error) {
    console.error('Error al obtener puntos de reciclaje:', error);
    res.status(500).json({ msg: 'Error al obtener los puntos de reciclaje', error: error.message });
  }
};

// Obtener un punto de reciclaje por ID
const getRecyclingPointById = async (req, res) => {
  try {
    const point = await RecyclingPoint.findById(req.params.id)
      .populate('createdBy', 'name email role');

    if (!point) {
      return res.status(404).json({ msg: 'Punto de reciclaje no encontrado' });
    }

    res.json(point);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de punto de reciclaje inválido' });
    }
    console.error('Error al buscar punto de reciclaje:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Crear nuevo punto de reciclaje (Gestor / Admin)
const createRecyclingPoint = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      lat,
      lng,
      acceptedCategories,
      schedule,
      contactPhone,
      pinColor,
      pinIcon,
      status
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: 'El nombre del punto de reciclaje es obligatorio' });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ msg: 'La dirección es obligatoria' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ msg: 'Se requieren coordenadas de latitud y longitud válidas' });
    }

    const newPoint = new RecyclingPoint({
      name: name.trim(),
      description: description ? description.trim() : '',
      address: address.trim(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        lat: latitude,
        lng: longitude
      },
      acceptedCategories: Array.isArray(acceptedCategories) && acceptedCategories.length > 0
        ? acceptedCategories
        : ['plastico', 'papel', 'vidrio'],
      schedule: schedule || 'Lunes a Viernes 08:00 a 18:00',
      contactPhone: contactPhone || '',
      pinColor: pinColor || '#10B981',
      pinIcon: pinIcon || 'recycle',
      status: status || 'activo',
      createdBy: req.user?._id
    });

    const savedPoint = await newPoint.save();
    res.status(201).json(savedPoint);
  } catch (error) {
    console.error('Error al crear punto de reciclaje:', error);
    res.status(500).json({ msg: 'Error al crear el punto de reciclaje', error: error.message });
  }
};

// Actualizar un punto de reciclaje (Gestor / Admin)
const updateRecyclingPoint = async (req, res) => {
  try {
    const point = await RecyclingPoint.findById(req.params.id);
    if (!point) {
      return res.status(404).json({ msg: 'Punto de reciclaje no encontrado' });
    }

    const {
      name,
      description,
      address,
      lat,
      lng,
      acceptedCategories,
      schedule,
      contactPhone,
      pinColor,
      pinIcon,
      status
    } = req.body;

    if (name !== undefined) point.name = name.trim();
    if (description !== undefined) point.description = description.trim();
    if (address !== undefined) point.address = address.trim();
    if (acceptedCategories !== undefined) point.acceptedCategories = acceptedCategories;
    if (schedule !== undefined) point.schedule = schedule;
    if (contactPhone !== undefined) point.contactPhone = contactPhone;
    if (pinColor !== undefined) point.pinColor = pinColor;
    if (pinIcon !== undefined) point.pinIcon = pinIcon;
    if (status !== undefined) point.status = status;

    if (lat !== undefined && lng !== undefined) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        point.location = {
          type: 'Point',
          coordinates: [longitude, latitude],
          lat: latitude,
          lng: longitude
        };
      }
    }

    point.updatedBy = req.user?._id;
    const updated = await point.save();

    res.json(updated);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de punto de reciclaje inválido' });
    }
    console.error('Error al actualizar punto de reciclaje:', error);
    res.status(500).json({ msg: 'Error al actualizar el punto de reciclaje' });
  }
};

// Eliminar punto de reciclaje (Gestor / Admin)
const deleteRecyclingPoint = async (req, res) => {
  try {
    const point = await RecyclingPoint.findById(req.params.id);
    if (!point) {
      return res.status(404).json({ msg: 'Punto de reciclaje no encontrado' });
    }

    await RecyclingPoint.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Punto de reciclaje eliminado correctamente' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'ID de punto de reciclaje inválido' });
    }
    console.error('Error al eliminar punto de reciclaje:', error);
    res.status(500).json({ msg: 'Error al eliminar el punto de reciclaje' });
  }
};

module.exports = {
  getRecyclingPoints,
  getRecyclingPointById,
  createRecyclingPoint,
  updateRecyclingPoint,
  deleteRecyclingPoint
};
