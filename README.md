# Tickets — Ciclo disonancia

Aplicación Next.js para reservar entradas gratuitas con verificación de correo.

## Flujo

1. El usuario ingresa su correo electrónico.
2. Recibe un código de 6 dígitos por email.
3. Verifica el código.
4. Reserva hasta **3 tickets por correo**, cada uno con un número único.

Los tickets emitidos se guardan en Supabase, en la tabla **`tickets_emitidos`**.

## Desarrollo local

```bash
npm install
cp .env.example .env
# Completá DATABASE_URL, DIRECT_URL y SMTP en .env
npm run db:migrate
npm run dev
```

## Base de datos — Supabase (gratis)

### 1. Crear proyecto

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto gratis.
2. En **Project Settings → Database**, copiá las URLs de conexión.

### 2. Variables en `.env`

Necesitás **dos** URLs de Supabase:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Connection pooling, puerto **6543** (`?pgbouncer=true`) — la usa la app |
| `DIRECT_URL` | Conexión directa, puerto **5432** — la usan las migraciones |

En el panel de Supabase: **Connect → ORMs → Prisma** te muestra ambas.

### 3. Crear las tablas

```bash
npm run db:migrate
```

Esto crea 3 tablas:

| Tabla | Contenido |
|-------|-----------|
| `tickets_emitidos` | **Tickets reservados** (número, email, fecha) |
| `verification_codes` | Códigos de verificación temporales |
| `sessions` | Sesiones activas post-verificación |

### 4. Ver los tickets

En Supabase: **Table Editor → tickets_emitidos**

Ahí ves todos los tickets emitidos con su número, correo y fecha.

## Desplegar en Vercel

1. Subí el repo a GitHub.
2. En [vercel.com](https://vercel.com), importá el proyecto.
3. Agregá las variables de entorno:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
4. En **Build Command**, usá:

```bash
npx prisma migrate deploy && npm run build
```

5. Deploy.

> Vercel + Supabase free tier alcanza tranquilo para un evento.

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL pooled (Supabase, puerto 6543) |
| `DIRECT_URL` | PostgreSQL directo (Supabase, puerto 5432) |
| `SMTP_*` | Configuración de correo (Nodemailer) |

## Personalizar evento

Editá `src/lib/config.ts` para cambiar nombre, fecha, lugar y límite de tickets.
