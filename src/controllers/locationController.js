// backend/src/controllers/locationController.js
require('dotenv').config();
const axios = require('axios');

// Geocodificación directa (Dirección -> Coordenadas)
const geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      return res.status(400).json({ msg: 'Dirección inválida. Mínimo 3 caracteres.' });
    }

    const trimmedAddress = address.trim();

    // 1. Si existe Google Maps API Key, intentar primero con Google
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios.get(url, {
          params: {
            address: trimmedAddress,
            key: process.env.GOOGLE_MAPS_API_KEY,
            language: 'es',
            region: 'ar'
          },
          timeout: 4000
        });

        const { results } = response.data;
        if (results && results.length > 0) {
          const { lat, lng } = results[0].geometry.location;
          const formattedAddress = results[0].formatted_address;
          return res.json({ lat, lng, formattedAddress });
        }
      } catch (googleErr) {
        console.warn('Fallo Google Geocode, usando fallback OpenStreetMap Nominatim:', googleErr.message);
      }
    }

    // 2. OpenStreetMap Nominatim (Gratuito, abierto y compatible con OpenFreeMap)
    const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    const nomRes = await axios.get(nominatimUrl, {
      params: {
        q: trimmedAddress,
        format: 'json',
        addressdetails: 1,
        limit: 1
      },
      headers: {
        'User-Agent': 'CirculApp/1.0 (circulapp.eco)'
      },
      timeout: 5000
    });

    if (nomRes.data && nomRes.data.length > 0) {
      const best = nomRes.data[0];
      return res.json({
        lat: parseFloat(best.lat),
        lng: parseFloat(best.lon),
        formattedAddress: best.display_name
      });
    }

    return res.status(404).json({ msg: 'No se encontró la dirección. Intenta con más detalles (calle, altura, ciudad).' });
  } catch (err) {
    console.error('Error en geocodificación:', err.message);
    res.status(500).json({ msg: 'Error al procesar la dirección. Verifica tu conexión.' });
  }
};

// Geocodificación inversa (Coordenadas -> Dirección)
const reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ msg: 'Coordenadas inválidas.' });
    }

    // 1. Si existe Google Maps API Key, intentar con Google
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json`;
        const response = await axios.get(url, {
          params: {
            latlng: `${latNum},${lngNum}`,
            key: process.env.GOOGLE_MAPS_API_KEY,
            language: 'es',
            region: 'ar'
          },
          timeout: 4000
        });

        const { results } = response.data;
        if (results && results.length > 0) {
          const formattedAddress = results[0].formatted_address;
          return res.json({ lat: latNum, lng: lngNum, formattedAddress });
        }
      } catch (googleErr) {
        console.warn('Fallo Google Reverse Geocode, usando fallback Nominatim:', googleErr.message);
      }
    }

    // 2. OpenStreetMap Nominatim Reverse
    const nominatimReverseUrl = 'https://nominatim.openstreetmap.org/reverse';
    const nomRes = await axios.get(nominatimReverseUrl, {
      params: {
        lat: latNum,
        lon: lngNum,
        format: 'json'
      },
      headers: {
        'User-Agent': 'CirculApp/1.0 (circulapp.eco)'
      },
      timeout: 5000
    });

    if (nomRes.data && nomRes.data.display_name) {
      return res.json({
        lat: latNum,
        lng: lngNum,
        formattedAddress: nomRes.data.display_name
      });
    }

    return res.status(404).json({ msg: 'No se encontró dirección para esa ubicación.' });
  } catch (err) {
    console.error('Error en reverse geocoding:', err.message);
    res.status(500).json({ msg: 'Error al obtener la dirección.' });
  }
};

module.exports = { geocodeAddress, reverseGeocode };