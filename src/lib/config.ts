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

export const MAX_TICKETS_PER_EMAIL = 3;

export const CODE_EXPIRY_MINUTES = 15;
export const SESSION_EXPIRY_HOURS = 2;
export const RESEND_COOLDOWN_SECONDS = 60;
