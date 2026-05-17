// backend/src/controllers/locationController.js
require('dotenv').config();
const axios = require('axios');

const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return res.status(400).json({ msg: 'Dirección inválida. Mínimo 5 caracteres.' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        address: address.trim(),
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: 'es',
        region: 'ar'
      }
    });

    const { results } = response.data;
    if (results.length === 0) {
      return res.status(404).json({ msg: 'No se encontró la dirección. Intenta con más detalles (calle, altura, ciudad).' });
    }

    const { lat, lng } = results[0].geometry.location;
    const formattedAddress = results[0].formatted_address;

    res.json({ lat, lng, formattedAddress });
  } catch (err) {
    console.error('Error en geocodificación:', err.message);
    res.status(500).json({ msg: 'Error al procesar la dirección. Verifica tu conexión.' });
  }
};

const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ msg: 'Coordenadas inválidas.' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json`;
    const response = await axios.get(url, {
      params: {
        latlng: `${latNum},${lngNum}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        language: 'es',
        region: 'ar'
      }
    });

    const { results } = response.data;
    if (results.length === 0) {
      return res.status(404).json({ msg: 'No se encontró dirección para esa ubicación.' });
    }

    const formattedAddress = results[0].formatted_address;
    res.json({ lat: latNum, lng: lngNum, formattedAddress });
  } catch (err) {
    console.error('Error en reverse geocoding:', err.message);
    res.status(500).json({ msg: 'Error al obtener la dirección.' });
  }
};

// Exporta ambas funciones
module.exports = { geocodeAddress, reverseGeocode };