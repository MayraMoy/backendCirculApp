// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

let transporterInstance = null;

/**
 * Obtener o crear transportador Nodemailer optimizado
 */
const getTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const isGmail = (process.env.EMAIL_SERVICE || '').toLowerCase() === 'gmail';
    const host = process.env.EMAIL_HOST || (isGmail ? 'smtp.gmail.com' : 'smtp-relay.brevo.com');
    const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
    const secure = port === 465;

    const options = {
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.trim()
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    };

    transporterInstance = nodemailer.createTransport(options);
    return transporterInstance;
  }

  // En desarrollo sin credenciales, usa Ethereal
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return transporterInstance;
  } catch (err) {
    console.warn('⚠️ No se pudo inicializar Ethereal Mail:', err.message);
    return null;
  }
};

/**
 * Enmascara direcciones de correo para prevenir fuga de PII en logs (P-041)
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '***';
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.length > 2 ? local.slice(0, 2) + '***' : local[0] + '***';
  return `${visible}@${domain}`;
};

const axios = require('axios');

/**
 * Enviar correo vía Brevo REST API (HTTPS Puerto 443 - Nunca es bloqueado por Render ni cloud hostings)
 */
const sendMailViaBrevoApi = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY;
  if (!apiKey) return false;

  const senderEmail = process.env.EMAIL_FROM_ADDRESS || 'ricardoalfredocejas97@gmail.com';
  const senderName = process.env.EMAIL_FROM_NAME || 'Circulapp ♻️';

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html || undefined,
    textContent: text || undefined
  };

  const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': apiKey.trim(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  return response.status >= 200 && response.status < 300;
};

/**
 * Enviar correo unificado optimizado para Bandeja Principal
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    // 1. Intentar vía Brevo REST API HTTPS si existe la clave API
    if (process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY) {
      try {
        const sent = await sendMailViaBrevoApi({ to, subject, html, text });
        if (sent) {
          console.log(`✉️ Correo "${subject}" enviado exitosamente vía Brevo HTTPS API a: ${maskEmail(to)}`);
          return true;
        }
      } catch (apiErr) {
        console.warn('⚠️ Falló Brevo API HTTPS, intentando fallback SMTP:', apiErr.response?.data || apiErr.message);
      }
    }

    // 2. Fallback a Nodemailer SMTP
    const transporter = await getTransporter();
    if (!transporter) return false;

    const defaultSender = 'ricardoalfredocejas97@gmail.com';
    const from = process.env.EMAIL_FROM || `"Circulapp ♻️" <${(process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@smtp-brevo.com')) ? process.env.EMAIL_USER : defaultSender}>`;
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      headers: {
        'X-Mailer': 'Circulapp-Auth/1.0',
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated'
      }
    });

    console.log(`✉️ Correo "${subject}" enviado exitosamente vía SMTP a: ${maskEmail(to)}`);
    return true;
  } catch (err) {
    console.error('❌ Error al enviar correo:', err.message);
    return false;
  }
};

/**
 * Enviar Email de Bienvenida tras el Registro (Diseño Transaccional Limpio)
 */
const sendWelcomeEmail = async (user) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = `Bienvenido a Circulapp, ${user.name}`;
  
  const text = `Hola ${user.name},\n\nGracias por registrarte en Circulapp.\n\nTu cuenta ha sido creada exitosamente. Ya puedes explorar los materiales reciclables disponibles y publicar tus propios lotes:\n\n${frontendUrl}/search\n\nSaludos cordiales,\nEl equipo de Circulapp`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <tr>
          <td style="background-color: #0F6E56; padding: 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Bienvenido a Circulapp</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px; font-size: 15px; line-height: 1.6;">
            <p style="margin-top: 0;">Hola <strong>${user.name}</strong>,</p>
            <p>Gracias por unirte a Circulapp, la plataforma para conectar generadores y recolectores de materiales reciclables.</p>
            <p>Tu cuenta ya está activa y lista para usar. Puedes comenzar buscando materiales o publicando los tuyos en nuestra red.</p>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="${frontendUrl}/search" style="background-color: #0F6E56; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                Explorar Catálogo de Materiales
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
              Circulapp • Red de Economía Circular
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({
    to: user.email,
    subject,
    text,
    html
  });
};

/**
 * Enviar Email de Recuperación de Contraseña con Token
 */
const sendResetPasswordEmail = async (user, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  const subject = `Restablecer contraseña de Circulapp`;

  const text = `Hola ${user.name},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta en Circulapp.\n\nPara ingresar tu nueva contraseña, haz clic en el siguiente enlace (válido por 15 minutos):\n${resetUrl}\n\nSi no solicitaste este cambio, puedes ignorar este correo.\n\nSaludos,\nEquipo de Seguridad Circulapp`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <tr>
          <td style="background-color: #0F6E56; padding: 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Restablecer Contraseña</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 28px 24px; font-size: 15px; line-height: 1.6;">
            <p style="margin-top: 0;">Hola <strong>${user.name}</strong>,</p>
            <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta asociada a <strong>${user.email}</strong>.</p>
            <p>Haz clic en el botón a continuación para crear tu nueva contraseña (enlace válido por 15 minutos):</p>
            
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="background-color: #0F6E56; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
                Cambiar Contraseña
              </a>
            </div>

            <p style="font-size: 13px; color: #6b7280;">
              Si no solicitaste este restablecimiento, no te preocupes, tu cuenta permanece segura y no se han hecho cambios.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
              Circulapp • Seguridad de la cuenta
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({
    to: user.email,
    subject,
    text,
    html
  });
};

/**
 * Enviar Email de Confirmación de Contraseña Actualizada
 */
const sendPasswordChangedEmail = async (user) => {
  const subject = `Tu contraseña de Circulapp ha sido actualizada`;
  const text = `Hola ${user.name},\n\nTe confirmamos que la contraseña de tu cuenta en Circulapp ha sido modificada exitosamente.\n\nSi no realizaste este cambio, por favor contacta con soporte.\n\nSaludos,\nEquipo Circulapp`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <tr>
          <td style="background-color: #0F6E56; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px;">Contraseña Actualizada</h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px; font-size: 15px; line-height: 1.6;">
            <p style="margin-top: 0;">Hola <strong>${user.name}</strong>,</p>
            <p>La contraseña de tu cuenta en Circulapp ha sido modificada correctamente.</p>
            <p style="font-size: 13px; color: #6b7280; margin-bottom: 0;">
              Si fuiste tú, no requieres hacer nada más. Si no reconoces esta acción, comunícate con nosotros de inmediato.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendMail({
    to: user.email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail
};
