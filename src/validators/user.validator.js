// backend/src/validators/user.validator.js
const { z } = require('zod');

const updateUserProfileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100, 'El nombre no puede exceder 100 caracteres.').optional(),
  email: z.string().trim().email('Formato de correo electrónico inválido.').optional(),
  phone: z.string().trim().max(30, 'El teléfono no puede exceder 30 caracteres.').optional().default(''),
  location: z.string().trim().max(250, 'La ubicación no puede exceder 250 caracteres.').optional().default(''),
  bio: z.string().trim().max(500, 'La biografía no puede exceder 500 caracteres.').optional().default('')
}).strip();

module.exports = {
  updateUserProfileSchema
};
