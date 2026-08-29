// backend/src/validators/auth.validator.js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),
  email: z.string({ required_error: 'El correo electrónico es obligatorio.' })
    .trim()
    .email('Formato de correo electrónico inválido.'),
  password: z.string({ required_error: 'La contraseña es obligatoria.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La contraseña debe contener al menos una letra.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),
  role: z.enum(['user', 'gestor', 'admin']).optional()
}).strip();

const loginSchema = z.object({
  email: z.string({ required_error: 'El correo electrónico es obligatorio.' })
    .trim()
    .email('Formato de correo electrónico inválido.'),
  password: z.string({ required_error: 'La contraseña es obligatoria.' })
    .min(1, 'Debes ingresar tu contraseña.')
});

const devSwitchRoleSchema = z.object({
  newRole: z.enum(['user', 'gestor', 'admin'], {
    errorMap: () => ({ message: 'Rol no válido. Permitidos: user, gestor, admin.' })
  })
});

const forgotPasswordSchema = z.object({
  email: z.string({ required_error: 'El correo electrónico es obligatorio.' })
    .trim()
    .email('Formato de correo electrónico inválido.')
});

const resetPasswordSchema = z.object({
  password: z.string({ required_error: 'La contraseña es obligatoria.' })
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Za-z]/, 'La nueva contraseña debe contener al menos una letra.')
    .regex(/[0-9]/, 'La nueva contraseña debe contener al menos un número.')
});

module.exports = {
  registerSchema,
  loginSchema,
  devSwitchRoleSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
