// backend/src/middleware/validate.js
const { ZodError } = require('zod');

/**
 * Middleware para validar peticiones HTTP contra esquemas Zod
 * @param {import('zod').ZodSchema} schema - Esquema de Zod
 * @param {'body' | 'query' | 'params'} [property='body'] - Propiedad de req a validar
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[property]);
      req[property] = parsed; // Asigna datos parseados/transformados
      next();
    } catch (err) {
      if (err instanceof ZodError || err.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        const errorMessages = issues.map(e => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message
        }));

        return res.status(400).json({
          msg: errorMessages[0]?.message || 'Datos de entrada inválidos.',
          errors: errorMessages
        });
      }
      next(err);
    }
  };
};

module.exports = validate;
