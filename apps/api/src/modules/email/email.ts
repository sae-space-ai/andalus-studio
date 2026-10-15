// Servicio de correo transaccional.
// Desarrollo: SMTP local (Mailpit). Si no hay SMTP configurado, las URLs de verificación
// se registran en un bucle in-memory SOLO para que los tests y el flujo de desarrollo
// funcionen — nunca se afirma entrega pública real por ello.
import nodemailer from "nodemailer";
import env from "../../config/env.js";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Bucle de correos enviados (visible solo en desarrollo/tests; útil para E2E)
export const devOutbox: Array<Mail & { sentAt: string; delivered: boolean }> = [];

let transporter: nodemailer.Transporter | null = null;
if (env.smtp.enabled) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
}

export async function sendMail(mail: Mail): Promise<{ delivered: boolean; note: string }> {
  if (transporter) {
    await transporter.sendMail({ from: env.smtp.from, ...mail });
    devOutbox.push({ ...mail, sentAt: new Date().toISOString(), delivered: true });
    return { delivered: true, note: "enviado por SMTP configurado" };
  }
  // Sin SMTP: NO decimos que se entregó. Queda registrado como no entregado.
  devOutbox.push({ ...mail, sentAt: new Date().toISOString(), delivered: false });
  return { delivered: false, note: "SMTP no configurado: correo NO entregado (solo registrado)" };
}
