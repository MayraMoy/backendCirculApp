const { z } = require('zod');

const createFeedbackSchema = z.object({
  comment: z.string({ required_error: 'El comentario o detalle es obligatorio.' })
    .trim()
    .min(1, 'El comentario o detalle es obligatorio.')
    .max(2000, 'El comentario no puede exceder 2000 caracteres.'),
  title: z.string().trim().max(150, 'El título no puede exceder 150 caracteres.').optional().default(''),
  category: z.string().trim().max(50).optional().default('general'),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  type: z.enum(['general_feedback', 'bug_report', 'suggestion', 'feature_request', 'ux_issue']).optional().default('general_feedback'),
  pageUrl: z.string().trim().max(250).optional().default('/'),
  featureTested: z.string().trim().max(100).optional().default(''),
  userName: z.string().trim().max(100).optional(),
  userEmail: z.string().trim().email('Formato de correo inválido.').optional().or(z.literal(''))
});

const updateFeedbackStatusSchema = z.object({
  status: z.enum(['nuevo', 'en_revision', 'resuelto', 'descartado'], {
    errorMap: () => ({ message: 'Estado de feedback inválido.' })
  })
});

module.exports = {
  createFeedbackSchema,
  updateFeedbackStatusSchema
};
