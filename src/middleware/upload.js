// backend/src/middleware/upload.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuración de almacenamiento local seguro como fallback primario o directo
const uploadDir = path.join(__dirname, '../../public/uploads/items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.USE_LOCAL_STORAGE !== 'true'
);

if (isCloudinaryConfigured) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'circulapp_uploads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
      }
    });
  } catch (err) {
    console.warn('⚠️ [Upload] No se pudo inicializar CloudinaryStorage, usando almacenamiento local:', err.message);
  }
}

if (!storage) {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `item-${uniqueSuffix}${ext}`);
    }
  });
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Máximo 5MB por imagen
    files: 5 // Máximo 5 imágenes simultáneas
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado. Solo se admiten imágenes JPG, PNG y WEBP.'), false);
    }
  }
});

module.exports = upload;