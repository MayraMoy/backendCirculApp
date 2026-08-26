// backend/src/validators/rating.validator.js
const { z } = require('zod');

const createRatingSchema = z.object({
  itemId: z.string({ required_error: 'El ID del ítem es requerido.' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de ítem inválido.'),
  materialQuality: z.coerce.number({ required_error: 'La calidad del material es obligatoria.' })
    .int()
    .min(1, 'La calidad debe ser entre 1 y 5.')
    .max(5, 'La calidad debe ser entre 1 y 5.'),
  punctuality: z.coerce.number().int().min(1).max(5).optional(),
  standardCompliance: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().trim().max(500, 'El comentario no puede exceder 500 caracteres.').optional().default('')
});

module.exports = {
  createRatingSchema
};
