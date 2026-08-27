// backend/src/validators/report.validator.js
const { z } = require('zod');

const createReportSchema = z.object({
  itemId: z.string().min(1, 'El ID de la publicación es obligatorio'),
  reason: z.enum([
    'contenido_inapropiado',
    'categoria_incorrecta',
    'informacion_falsa',
    'material_no_reciclable',
    'spam_o_duplicado',
    'contacto_invalido',
    'otro'
  ], {
    errorMap: () => ({ message: 'Selecciona un motivo de denuncia válido' })
  }),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional().default('')
}).strict();

const resolveReportSchema = z.object({
  status: z.enum(['desestimada', 'en_revision', 'publicacion_eliminada'], {
    errorMap: () => ({ message: 'Estado de resolución no válido' })
  }),
  resolutionNotes: z.string().max(500).optional().default('')
}).strict();

module.exports = {
  createReportSchema,
  resolveReportSchema
};
