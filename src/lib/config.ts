export const EVENT = {
  name: "Ciclo disonancia",
  edition: "Edición feliz cumple chango",
  venue: "La Gesta Cultural",
  address: "Av Alem 747",
  date: "Sábado 13 de junio",
  dateShort: "13.06",
  time: "21 hs",
  artists: [
    "Calle cortada",
    "El chango y las flores",
    "Utópico amanecer",
    "Olita",
  ],
  description:
    "Reservá tus entradas gratuitas. Verificamos tu correo para que cada persona reciba sus tickets.",
} as const;

export const CONFIRMATION_MESSAGE =
  "te esperamos el sábado, podés llevar un regalo para el maikel chango";

export const CONTRIBUTION_MESSAGE =
  "La entrada es gratuita, pero podés contribuir a la causa en este alias CICLO.DISONANCIA, a nombre de Nicolas Enrique Alonso";

export const MAX_TOTAL_TICKETS = 176;
export const MAX_TICKETS_PER_EMAIL = 1;
export const MAX_TICKETS_LEGACY_PER_EMAIL = 3;
export const RETURN_LINK_EXPIRY_DAYS = 14;

export const TICKET_STATUS = {
  active: "active",
  released: "released",
} as const;

export const SOLD_OUT_TITLE = "SOLD OUT";
export const SOLD_OUT_MESSAGE =
  "Comunicate con tu banda fav para la lista de espera.";

export const CODE_EXPIRY_MINUTES = 15;
export const SESSION_EXPIRY_HOURS = 2;
export const RESEND_COOLDOWN_SECONDS = 60;
