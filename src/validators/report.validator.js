// backend/src/validators/report.validator.js
const { z } = require('zod');

const createReportSchema = z.object({
  targetType: z.enum(['item', 'user']).optional().default('item'),
  itemId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.enum([
    // Motivos publicaciones
    'contenido_inapropiado',
    'categoria_incorrecta',
    'informacion_falsa',
    'material_no_reciclable',
    'spam_o_duplicado',
    'contacto_invalido',
    // Motivos usuarios
    'usuario_sospechoso',
    'comportamiento_abusivo',
    'estafa_o_fraude',
    'suplantacion_identidad',
    'contacto_falso_o_invalido',
    // Común
    'otro'
  ], {
    errorMap: () => ({ message: 'Selecciona un motivo de denuncia válido' })
  }),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional().default('')
}).refine(
  (data) => {
    if (data.targetType === 'user') {
      return !!data.reportedUserId && data.reportedUserId.trim().length > 0;
    }
    return !!data.itemId && data.itemId.trim().length > 0;
  },
  {
    message: 'Debes especificar el elemento o usuario a denunciar.',
    path: ['itemId']
  }
);

const resolveReportSchema = z.object({
  status: z.enum(['desestimada', 'en_revision', 'publicacion_eliminada', 'usuario_suspendido'], {
    errorMap: () => ({ message: 'Estado de resolución no válido' })
  }),
  resolutionNotes: z.string().max(500).optional().default('')
}).strip();

module.exports = {
  createReportSchema,
  resolveReportSchema
};
