// backend/src/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Asegurar configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Extrae el public_id de Cloudinary a partir de una URL segura
 * Ejemplos soportados:
 * - https://res.cloudinary.com/dpcjrnmly/image/upload/v1740000000/circulapp_uploads/n9j0k234_abc.png -> circulapp_uploads/n9j0k234_abc
 * - https://res.cloudinary.com/demo/image/upload/c_fill,w_300/v1234/circulapp_uploads/sample.jpg -> circulapp_uploads/sample
 * - circulapp_uploads/sample -> circulapp_uploads/sample
 */
const extractPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  // Si ya es un publicId directo (no URL)
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    const lastDot = imageUrl.lastIndexOf('.');
    return lastDot !== -1 ? imageUrl.substring(0, lastDot) : imageUrl;
  }

  const parts = imageUrl.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  // Filtrar segmentos de transformaciones (ej: c_fill,w_300) y versiones (v123456)
  const relevantParts = parts
    .slice(uploadIndex + 1)
    .filter(segment => !segment.match(/^v\d+$/) && !segment.includes(','));

  if (relevantParts.length === 0) return null;

  const fullPathWithExt = relevantParts.join('/');
  const lastDot = fullPathWithExt.lastIndexOf('.');
  return lastDot !== -1 ? fullPathWithExt.substring(0, lastDot) : fullPathWithExt;
};

/**
 * Elimina una o varias imágenes de Cloudinary de forma asíncrona y segura
 * @param {string|string[]} imageUrls - URL o arreglo de URLs a eliminar
 */
const deleteFromCloudinary = async (imageUrls) => {
  if (!imageUrls) return;
  const urls = Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [imageUrls].filter(Boolean);

  for (const url of urls) {
    try {
      const publicId = extractPublicId(url);
      if (publicId) {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ [Cloudinary] Imagen eliminada (${publicId}):`, result.result);
      }
    } catch (err) {
      console.warn(`⚠️ [Cloudinary] Error al eliminar imagen (${url}):`, err.message);
    }
  }
};

module.exports = {
  cloudinary,
  extractPublicId,
  deleteFromCloudinary
};
