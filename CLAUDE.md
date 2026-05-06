@AGENTS.md

# Coffee Corner

Tracker personal de café de especialidad. Mobile-first, responsive, diseño moderno y minimalista. Single-user de momento, con schema preparado para multi-usuario.

## Estructura del proyecto

```
app/
  api/
    auth/{login,logout}/route.ts   # endpoints auth password-based
  login/page.tsx                    # form de login
  layout.tsx                        # root layout + Providers
  page.tsx                          # home
  providers.tsx                     # QueryClientProvider (TanStack Query)
  globals.css                       # Tailwind 4 + tokens shadcn
components/ui/                      # componentes shadcn (añadir con `npx shadcn add <name>`)
db/
  schema.ts                         # Drizzle schema (roasters, coffees)
  index.ts                          # cliente Drizzle + Neon HTTP driver
  migrations/                       # SQL generado por drizzle-kit
lib/
  auth.ts                           # HMAC sign/verify (Web Crypto, Edge-compatible)
  constants.ts                      # SOLO_USER_ID
  utils.ts                          # cn() de shadcn
proxy.ts                            # password gate (en Next 16, middleware se llama Proxy)
drizzle.config.ts
.env.example
```

## Stack

- **Next.js 16** App Router. Route Handlers en `app/api/*/route.ts`. No Server Actions.
- **React 19**, **TypeScript**, **Tailwind 4** (CSS-first, sin `tailwind.config.js`)
- **shadcn/ui** + Lucide icons
- **Drizzle ORM** + **Neon Postgres** (`@neondatabase/serverless`, driver HTTP)
- **TanStack Query** para fetching desde el cliente
- **React Hook Form + Zod** (mismo schema cliente/servidor)
- Hosting: **Vercel** free tier

## Decisiones clave

- **Sin Prisma, sin Supabase**: la fricción anterior venía de capas opacas. Drizzle = SQL transparente; Neon = Postgres puro.
- **Route Handlers > Server Actions**: preferencia explícita del usuario.
- **Auth**: password único + cookie firmada (HMAC) en `proxy.ts`. HttpOnly, SameSite=lax, 30 días. Migración futura a Auth.js sin tocar el modelo de datos.
- **Schema multi-user-ready desde día 1**: `user_id` en `roasters` y `coffees`. Hoy todo se stampa con `SOLO_USER_ID` de `lib/constants.ts`. Cuando se añada auth real, sustituir por `session.user.id` — cero migración de datos.
- **Stock**: solo botón "Ver en la web" (link directo a `product_url`). Scraping queda para Fase 3.
- **Precios** en `price_cents` (integer), evita floats.
- **`casing: 'snake_case'`** en `drizzle.config.ts`: TS usa camelCase, DB snake_case automáticamente.

## Modelo de datos

- `roasters`: `id` (uuid), `user_id`, `name`, `website_url`, `country`, `notes`, `created_at`, `updated_at`
- `coffees`: `id` (uuid), `user_id`, `roaster_id` (FK cascade), `name`, `origin`, `variety`, `process`, `price_cents`, `weight_g`, `product_url`, `rating` (real 0–5), `tasting_notes` (`text[]`), `review`, `purchased_at`, `created_at`, `updated_at`

Índices en `user_id` (ambas tablas) y `roaster_id` (coffees).

## Auth flow

1. Request a ruta protegida → `proxy.ts` lee cookie `cc_auth`, recalcula HMAC con `COOKIE_SECRET`, compara constant-time. Si no coincide → redirect a `/login`.
2. `/login` → form que POSTea a `/api/auth/login` con la password.
3. Endpoint compara contra `APP_PASSWORD` (constant-time), genera HMAC, setea cookie `cc_auth` HttpOnly.
4. Logout → POST a `/api/auth/logout` borra la cookie.

Rutas públicas (whitelist en `proxy.ts`): `/login`, `/api/auth/login`. El matcher excluye assets estáticos.

## Convenciones

- **UI en español** (textos visibles al usuario).
- **Mobile-first**: estilos base sin breakpoint, escalar con `sm:`, `md:`...
- **Validación**: schemas Zod compartidos cliente/servidor desde un único sitio (`lib/validation.ts` cuando se cree).
- **TanStack Query**: query keys consistentes — `['roasters']`, `['roasters', id]`, `['coffees', { roasterId }]`. Invalidar por mutación.
- **Errores en API**: `{ error: '...' }` con status apropiado (400/401/404/500).
- **`user_id` siempre filtrado**: toda query a `roasters`/`coffees` debe filtrar por `SOLO_USER_ID` aunque hoy haya un solo usuario — facilita la migración futura y refleja la intención.

## Variables de entorno (`.env.local`)

- `DATABASE_URL` — connection string de Neon
- `APP_PASSWORD` — password única para el middleware
- `COOKIE_SECRET` — secreto para firmar la cookie (`openssl rand -base64 32`)

`.env.example` está commiteado como referencia.

## Comandos

- `npm run dev` — dev server (Turbopack)
- `npm run build` — build de producción
- `npm run db:generate` — genera SQL en `db/migrations/` desde el schema
- `npm run db:migrate` — aplica migraciones pendientes a Neon
- `npm run db:push` — push directo del schema (dev/prototyping)
- `npm run db:studio` — UI de Drizzle para inspeccionar la DB
- `npx shadcn add <component>` — añadir un componente shadcn

## Roadmap

1. **Fase 0 — Setup** (completada): bootstrap, shadcn, Drizzle, providers, proxy, primera migración a Neon, deploy a Vercel.
2. **Fase 1 — MVP**: CRUD vía API routes; vistas `/`, `/roasters/[id]`, `/coffees/[id]`; formularios.
3. **Fase 2 — UX**: búsqueda, filtros (rating/proceso/origen), orden, skeletons, toasts.
4. **Fase 3**: fotos del paquete (Vercel Blob), stats, scraping de stock para tostadores top.

## TODO

### Cerrando Fase 0

- [x] Crear cuenta + proyecto en Neon, copiar `DATABASE_URL` a `.env.local`
- [x] Definir `APP_PASSWORD` y generar `COOKIE_SECRET` (`openssl rand -base64 32`)
- [x] `drizzle.config.ts` corregido para leer `.env.local` (en lugar de `.env`)
- [x] `npm run db:generate` → `npm run db:push` — schema aplicado en Neon
- [x] Smoke test: login funciona, home carga correctamente
- [x] Push a repo GitHub
- [x] Conectar repo a Vercel + añadir las 3 env vars en el dashboard de Vercel

### Fase 1 — MVP

- [x] `lib/validation.ts` con schemas Zod compartidos para `Roaster` y `Coffee`
- [x] API routes (todas filtradas por `SOLO_USER_ID`):
  - [x] `GET/POST /api/roasters`
  - [x] `GET/PATCH/DELETE /api/roasters/[id]`
  - [x] `GET/POST /api/coffees` (con `?roasterId=` opcional)
  - [x] `GET/PATCH/DELETE /api/coffees/[id]`
- [x] Hooks TanStack Query: `useRoasters`, `useRoaster(id)`, `useCoffees({ roasterId? })`, `useCoffee(id)`, y mutations correspondientes
- [x] Vistas:
  - [x] `/` — grid de tostadores (card con nº cafés + rating medio)
  - [x] `/roasters/[id]` — listado de cafés del tostador
  - [x] `/coffees/[id]` — detalle completo + botón "Ver en la web"
  - [x] `/roasters/new`, `/coffees/new` — formularios (RHF + Zod)
  - [x] Edición (in-place o `/coffees/[id]/edit` — decidir)
- [x] Layout con header (link a home + botón logout)
- [x] Estados vacíos y de error cuidados
