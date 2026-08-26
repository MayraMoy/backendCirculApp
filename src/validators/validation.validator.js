// backend/src/validators/validation.validator.js
const { z } = require('zod');

const validateMaterialSchema = z.object({
  itemId: z.string({ required_error: 'El ID del ítem es requerido.' })
    .regex(/^[0-9a-fA-F]{24}$/, 'ID de ítem inválido.'),
  checklist: z.array(z.string(), { required_error: 'El checklist es obligatorio.' })
    .length(4, 'El checklist debe contener exactamente los 4 criterios de validación.')
    .refine((arr) => {
      const required = ['limpieza', 'homogeneidad', 'compactado', 'etiquetado'];
      return required.every(item => arr.includes(item));
    }, {
      message: 'El checklist debe incluir: limpieza, homogeneidad, compactado y etiquetado.'
    }),
  observations: z.string().trim().max(500, 'Las observaciones no pueden exceder 500 caracteres.').optional().default('')
});

module.exports = {
  validateMaterialSchema
};
