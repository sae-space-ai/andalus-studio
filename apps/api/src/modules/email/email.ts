/**
 * Módulo de Email
 * ANDALUS STUDIO API - FASE 02
 */

import nodemailer from 'nodemailer';
import { Env } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

/**
 * Inicializa el transporter de email
 */
export function initEmailTransporter(env: Env): void {
  if (env.EMAIL_PROVIDER === 'smtp') {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  } else {
    // Console provider para desarrollo
    transporter = null;
  }
}

/**
 * Envía un email
 */
export async function sendEmail(
  env: Env,
  options: EmailOptions
): Promise<boolean> {
  if (env.EMAIL_PROVIDER === 'none') {
    console.log('📧 Email deshabilitado:', options.subject);
    return false;
  }

  if (env.EMAIL_PROVIDER === 'console' || !transporter) {
    // Modo desarrollo: imprimir en consola
    console.log('═══════════════════════════════════════');
    console.log('📧 EMAIL (MODO DESARROLLO)');
    console.log('═══════════════════════════════════════');
    console.log(`Para: ${options.to}`);
    console.log(`Asunto: ${options.subject}`);
    console.log('───────────────────────────────────────');
    console.log(options.text || options.html.replace(/<[^>]*>/g, ''));
    console.log('═══════════════════════════════════════');
    return true;
  }

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

/**
 * Envía email de verificación
 */
export async function sendVerificationEmail(
  env: Env,
  email: string,
  token: string,
  displayName: string
): Promise<boolean> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail(env, {
    to: email,
    subject: 'Verifica tu cuenta en Andalus Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007A3D;">¡Bienvenido/a a Andalus Studio!</h1>
        <p>Hola ${displayName},</p>
        <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007A3D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verificar Email
          </a>
        </p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 24 horas.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Al-Andalus AI · Andalus Studio<br>
          INTELLIGENCE · ENGINEERING · EUROPE
        </p>
      </div>
    `,
    text: `
Hola ${displayName},

Gracias por registrarte en Andalus Studio. Para completar tu registro, visita el siguiente enlace:

${verificationUrl}

Este enlace expirará en 24 horas.

--
Al-Andalus AI · Andalus Studio
INTELLIGENCE · ENGINEERING · EUROPE
    `,
  });
}

/**
 * Envía email de recuperación de contraseña
 */
export async function sendPasswordResetEmail(
  env: Env,
  email: string,
  token: string,
  displayName: string
): Promise<boolean> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  return sendEmail(env, {
    to: email,
    subject: 'Recuperación de contraseña - Andalus Studio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #007A3D;">Recuperación de Contraseña</h1>
        <p>Hola ${displayName},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este email.</p>
        <p>Para establecer una nueva contraseña, haz clic en el siguiente enlace:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007A3D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px;">Este enlace expirará en 1 hora.</p>
        <p style="color: #666; font-size: 14px;">Si no solicitaste restablecer tu contraseña, no es necesario que hagas nada.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Al-Andalus AI · Andalus Studio<br>
          INTELLIGENCE · ENGINEERING · EUROPE
        </p>
      </div>
    `,
    text: `
Hola ${displayName},

Hemos recibido una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este email.

Para establecer una nueva contraseña, visita el siguiente enlace:

${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste restablecer tu contraseña, no es necesario que hagas nada.

--
Al-Andalus AI · Andalus Studio
INTELLIGENCE · ENGINEERING · EUROPE
    `,
  });
}
