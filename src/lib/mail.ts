import { readFileSync } from "fs";
import path from "path";
import nodemailer from "nodemailer";
import {
  CONFIRMATION_MESSAGE,
  CONTRIBUTION_MESSAGE,
  EVENT,
  TICKET_GUARANTEE_MESSAGE,
} from "./config";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const emailWrapper = (content: string) => `
  <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #000; color: #fff; padding: 32px; border-radius: 8px;">
    <p style="margin: 0 0 4px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6);">Ciclo</p>
    <h1 style="margin: 0 0 24px; font-size: 28px; font-weight: normal; text-transform: lowercase; color: #8ed8e8;">disonancia</h1>
    ${content}
    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 24px 0;" />
    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.4);">${EVENT.venue} · ${EVENT.address}<br/>${EVENT.date} · ${EVENT.time}</p>
  </div>
`;

function getMaikelChangoAttachment() {
  const imagePath = path.join(process.cwd(), "public", "maikel-chango.png");
  return {
    filename: "maikel-chango.png",
    content: readFileSync(imagePath),
    cid: "maikel-chango",
  };
}

export async function sendVerificationCode(email: string, code: string) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  const subject = `Código de verificación — ${EVENT.name}`;
  const text = [
    `Tu código para sacar tickets de ${EVENT.name} es: ${code}`,
    ``,
    `${EVENT.date} · ${EVENT.time}`,
    `${EVENT.venue}, ${EVENT.address}`,
    ``,
    `El código vence en 15 minutos.`,
  ].join("\n");

  const html = emailWrapper(`
    <p style="color: rgba(255,255,255,0.7);">Tu código de verificación:</p>
    <p style="font-size: 36px; letter-spacing: 10px; font-weight: bold; color: #8ed8e8; text-align: center; padding: 20px; border: 1px solid rgba(142,216,232,0.3); border-radius: 8px; margin: 16px 0;">${code}</p>
    <p style="font-size: 13px; color: rgba(255,255,255,0.5);">Vence en 15 minutos.</p>
  `);

  if (!transporter || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Código para ${email}: ${code}`);
      return;
    }
    throw new Error("SMTP no configurado");
  }

  await transporter.sendMail({ from, to: email, subject, text, html });
}

function buildTicketEmailHtml(numbers: string[]) {
  const ticketNumbersHtml = numbers
    .map(
      (n) => `
      <tr>
        <td align="center" style="padding: 10px 0;">
          <div style="display: inline-block; border: 2px solid #8ed8e8; border-radius: 8px; padding: 14px 32px; background: #0a0a0a;">
            <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.45); font-family: Arial, sans-serif;">N° de entrada</p>
            <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #8ed8e8; font-family: 'Courier New', Courier, monospace;">${n}</p>
          </div>
        </td>
      </tr>`,
    )
    .join("");

  return `
  <div style="background: #111; padding: 24px 12px; font-family: Georgia, serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 420px; margin: 0 auto;">
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #000; border: 2px solid #8ed8e8; border-radius: 16px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td style="padding: 28px 24px 20px; text-align: center; border-bottom: 2px dashed rgba(142,216,232,0.35);">
                <p style="margin: 0 0 4px; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-family: Arial, sans-serif;">Ciclo</p>
                <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: normal; text-transform: lowercase; color: #8ed8e8; letter-spacing: 1px;">disonancia</h1>
                <p style="margin: 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-family: Arial, sans-serif;">Entrada gratuita</p>
              </td>
            </tr>

            <!-- Event info -->
            <tr>
              <td style="padding: 20px 24px; text-align: center; border-bottom: 2px dashed rgba(142,216,232,0.35);">
                <p style="margin: 0 0 6px; font-size: 15px; color: #fff;">${EVENT.date}</p>
                <p style="margin: 0 0 6px; font-size: 15px; color: #8ed8e8; font-weight: bold;">${EVENT.time}</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: rgba(255,255,255,0.7);">${EVENT.venue}</p>
                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.45); font-family: Arial, sans-serif;">${EVENT.address}</p>
              </td>
            </tr>

            <!-- Ticket numbers -->
            <tr>
              <td style="padding: 24px 24px 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${ticketNumbersHtml}
                </table>
              </td>
            </tr>

            <!-- Perforation + message -->
            <tr>
              <td style="padding: 0 24px 20px; border-top: 2px dashed rgba(142,216,232,0.35);">
                <p style="margin: 20px 0 16px; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.85); text-align: center;">${CONFIRMATION_MESSAGE}</p>
                <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.7; color: #8ed8e8; text-align: center; padding: 12px; border: 1px solid rgba(142,216,232,0.35); border-radius: 8px; background: rgba(142,216,232,0.08);">${TICKET_GUARANTEE_MESSAGE}</p>
                <img src="cid:maikel-chango" alt="Maikel Chango" width="320" style="display: block; max-width: 100%; height: auto; border-radius: 10px; margin: 0 auto; border: 1px solid rgba(142,216,232,0.25);" />
                <p style="margin: 20px 0 0; font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.7); text-align: center; padding: 14px; border: 1px solid rgba(142,216,232,0.2); border-radius: 8px; background: #0a0a0a;">
                  La entrada es gratuita, pero podés contribuir a la causa en este alias
                  <strong style="color: #8ed8e8; letter-spacing: 1px;">CICLO.DISONANCIA</strong>,
                  a nombre de <strong style="color: #fff;">Nicolas Enrique Alonso</strong>
                </p>
              </td>
            </tr>

            <!-- Footer stub -->
            <tr>
              <td style="padding: 16px 24px 24px; background: #0a0a0a; text-align: center; border-top: 2px dashed rgba(142,216,232,0.35);">
                <p style="margin: 0 0 6px; font-size: 22px; font-weight: bold; color: #8ed8e8; font-family: Arial, sans-serif; letter-spacing: 2px;">${EVENT.dateShort}</p>
                <p style="margin: 0; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-family: Arial, sans-serif;">Presentá este correo en la entrada</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

export async function sendTicketsConfirmation(
  email: string,
  ticketNumbers: number[],
) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const numbers = ticketNumbers.map((n) => `#${String(n).padStart(4, "0")}`);

  const subject = `Tus entradas — ${EVENT.name}`;
  const text = [
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  CICLO DISONANCIA — ENTRADA`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `${EVENT.date} · ${EVENT.time}`,
    `${EVENT.venue}, ${EVENT.address}`,
    ``,
    ...numbers.map((n) => `  TICKET ${n}`),
    ``,
    `──────────────────────────────`,
    CONFIRMATION_MESSAGE,
    TICKET_GUARANTEE_MESSAGE,
    `──────────────────────────────`,
    ``,
    CONTRIBUTION_MESSAGE,
    ``,
    `Presentá este correo en la entrada.`,
  ].join("\n");

  const html = buildTicketEmailHtml(numbers);

  if (!transporter || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Tickets para ${email}: ${numbers.join(", ")}`);
      console.log(`[DEV] ${CONFIRMATION_MESSAGE}`);
      console.log(`[DEV] ${TICKET_GUARANTEE_MESSAGE}`);
      console.log(`[DEV] ${CONTRIBUTION_MESSAGE}`);
      return;
    }
    throw new Error("SMTP no configurado");
  }

  await transporter.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
    attachments: [getMaikelChangoAttachment()],
  });
}

function buildReturnInvitationHtml(
  url: string,
  ticketNumbers: number[],
  quantityHint: string,
) {
  const ticketsLabel = ticketNumbers
    .map((n) => `#${String(n).padStart(4, "0")}`)
    .join(" · ");

  return emailWrapper(`
    <p style="color: rgba(255,255,255,0.85); line-height: 1.7;">Hola,</p>
    <p style="color: rgba(255,255,255,0.85); line-height: 1.7;">
      Queremos confirmar si vas a poder asistir a <strong style="color: #8ed8e8;">${EVENT.name}</strong>.
    </p>
    <p style="margin: 16px 0; padding: 16px; border: 1px solid rgba(142,216,232,0.25); border-radius: 8px; color: rgba(255,255,255,0.8); line-height: 1.7; text-align: center;">
      ${EVENT.date} · ${EVENT.time}<br/>
      ${EVENT.venue}, ${EVENT.address}
    </p>
    <p style="color: rgba(255,255,255,0.85); line-height: 1.7;">
      Si vas a venir, nos vemos ahí. No tenés que hacer nada.
    </p>
    <p style="color: rgba(255,255,255,0.85); line-height: 1.7;">
      Si no vas a poder asistir, podés devolver tus entradas desde este botón:
    </p>
    <p style="margin: 28px 0; text-align: center;">
      <a href="${url}" style="display: inline-block; background: #8ed8e8; color: #000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 15px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Devolver mis entradas</a>
    </p>
    <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.45);">Tus entradas activas</p>
    <p style="margin: 0 0 16px; font-family: 'Courier New', Courier, monospace; font-size: 18px; font-weight: bold; color: #8ed8e8; text-align: center;">${ticketsLabel}</p>
    <p style="color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.7; text-align: center;">${quantityHint}</p>
    <p style="margin-top: 20px; font-size: 13px; color: rgba(255,255,255,0.45); text-align: center;">
      Si el botón no funciona, copiá este enlace:<br/>
      <a href="${url}" style="color: #8ed8e8; word-break: break-all;">${url}</a>
    </p>
    <p style="margin-top: 24px; color: rgba(255,255,255,0.7); line-height: 1.7;">Gracias por avisar,<br/>Ciclo disonancia</p>
  `);
}

export async function sendReturnInvitation(
  email: string,
  subject: string,
  text: string,
  url: string,
  ticketNumbers: number[],
  quantityHint: string,
) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const html = buildReturnInvitationHtml(url, ticketNumbers, quantityHint);

  if (!transporter || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Invitación de asistencia para ${email}:`);
      console.log(text);
      console.log(`[DEV] Botón: ${url}`);
      return;
    }
    throw new Error("SMTP no configurado");
  }

  await transporter.sendMail({ from, to: email, subject, text, html });
}
