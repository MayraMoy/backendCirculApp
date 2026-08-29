// backend/src/validators/item.validator.js
const { z } = require('zod');

const validCategories = ['plastico', 'papel', 'vidrio', 'metal', 'textil', 'electronico', 'otro'];
const validStates = ['sin_procesar', 'en_proceso', 'fardado', 'validado'];

const createItemSchema = z.object({
  title: z.string({ required_error: 'El título es obligatorio.' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres.')
    .max(120, 'El título no puede exceder 120 caracteres.'),
  description: z.string().trim().max(1000, 'La descripción no puede exceder 1000 caracteres.').optional().default(''),
  category: z.enum(validCategories, {
    errorMap: () => ({ message: `Categoría inválida. Opciones: ${validCategories.join(', ')}.` })
  }),
  address: z.string().trim().max(250).optional().default(''),
  lat: z.coerce.number({ required_error: 'La latitud es requerida.' })
    .min(-90, 'Latitud debe estar entre -90 y 90.')
    .max(90, 'Latitud debe estar entre -90 y 90.'),
  lng: z.coerce.number({ required_error: 'La longitud es requerida.' })
    .min(-180, 'Longitud debe estar entre -180 y 180.')
    .max(180, 'Longitud debe estar entre -180 y 180.')
});

const updateItemSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(validCategories).optional(),
  address: z.string().trim().max(250).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  keepImages: z.union([z.string(), z.array(z.string())]).optional()
});

const searchItemsQuerySchema = z.object({
  query: z.string().trim().optional(),
  category: z.enum(validCategories).optional(),
  processingState: z.string().trim().refine(
    (val) => {
      const parts = val.split(',').map(s => s.trim());
      return parts.every(part => validStates.includes(part));
    },
    { message: `Estado(s) de procesamiento inválido(s). Opciones válidas: ${validStates.join(', ')}.` }
  ).optional(),
  ownerId: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

module.exports = {
  createItemSchema,
  updateItemSchema,
  searchItemsQuerySchema
};
