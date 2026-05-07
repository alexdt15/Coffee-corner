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

### Fase 2 — UX

Decisiones tomadas:

- **Navegación**: bottom nav fija con dos tabs (Cafés / Tostadores). Cafés es el tab por defecto.
- **URLs**: `/` → tab Cafés (lista plana ordenada por rating desc). `/roasters` → tab Tostadores. Detalles igual que Fase 1.
- **Búsqueda**: barra global persistente en el header, aplica al tab activo. Busca en todas las columnas de texto que tengan sentido (nombre, origen, variedad, proceso, tasting_notes, review, country, notes).
- **Filtros**: botón "Filtros" abre un sheet (bottom). Chips multi-select de origen, proceso y rating mínimo. Valores se rellenan dinámicamente desde el dataset completo del usuario.
- **Filtrado**: en cliente de momento (dataset pequeño). Estado en URL params (`?q=…&origin=…&process=…&minRating=…`).
- **Estética**: inspiración ibrew.coffee — foco en spacing generoso, tipografía con buen tracking, alineación icono-texto cuidada. Dark mode queda para más adelante.
- **Avatar de café**: placeholder reservado con la dimensión final del paquete (Fase 3 lo sustituye por foto real).
- **Toasts**: sonner.
- **Skeletons** en listados y detalle. Spinner solo en submits.

#### Bloque A — Fundamentos visuales ✓

- [x] Moodboard textual aprobado (paleta, tipografía, spacing, radius)
- [x] Tokens en `globals.css` (Tailwind 4 CSS-first, sobre los de shadcn) — paleta terracota/cream, `--radius: 1rem`
- [x] Tipografía cargada con `next/font` → CSS variables — Fraunces (`--font-heading`) + Geist (`--font-sans`)

#### Bloque B — App shell ✓

- [x] Restructura: `/` → tab Cafés, `/roasters` → tab Tostadores; back-links corregidos
- [x] Layout: header sticky + main `pb-24` + `<BottomNav>` fija con `safe-area-inset-bottom`
- [x] `<BottomNav>`: dot terracota + `scale-110` + `font-semibold` en tab activo (opción C)
- [x] Header: dos filas — brand/logout + búsqueda debounceada 250ms con URL params; botón Filtros solo en `/`

#### Bloque C — Tab Cafés ✓

- [x] Estado de search/filtros en URL (`?q=…&origin=…&process=…&minRating=…`), debounce 250ms
- [x] `useCoffeeFilterOptions()` — devuelve valores únicos del dataset completo (no del filtrado)
- [x] Filtrado en cliente sobre `useCoffees()` completo; lógica extraída en `filterCoffees()`
- [x] `<FilterSheet>` (Sheet `side="bottom"`): secciones Origen / Proceso / Rating mínimo, chips multi-select, "Limpiar" + "Ver resultados"
- [x] Badge en botón Filtros con conteo de filtros activos + chips removibles inline
- [x] `<CoffeeCard>` rediseñada: avatar `CoffeeAvatarPlaceholder` (gradiente cálido único por ID), nombre, tostador, pills origen/proceso, rating con estrella terracota
- [x] `<CoffeeAvatarPlaceholder>` reutilizable — gradiente warm hue derivado del ID del café
- [x] Lista ordenada por rating desc (sin rating al final); header "Tus cafés" + botón "Añadir"
- [x] Skeletons (`CoffeeCardSkeleton`) con `animate-pulse`
- [x] Tres estados vacíos diferenciados: sin cafés / sin resultados de búsqueda / filtros sin matches
- [x] `/coffees/new` acepta entrada sin `?roasterId=`: selector de tostador dinámico (auto-selecciona si hay uno solo); mensaje guiado si no hay tostadores

#### Bloque D — Tab Tostadores

- [ ] `<RoasterCard>` restyling para coherencia visual
- [ ] Búsqueda aplicada (mismo `q`, sobre nombre / país / notes)
- [ ] Skeletons + estado vacío

#### Bloque E — Detalles

- [ ] `/coffees/[id]` rediseño: hero con avatar grande, jerarquía (nombre, tostador, rating), notas como pills, review destacado, CTA "Ver en la web"
- [ ] `/roasters/[id]` restyling mínimo: header del tostador + lista usando la misma `<CoffeeCard>`

#### Bloque F — Polish

- [ ] Forms (RHF + shadcn) — pase de consistencia visual con los nuevos tokens
- [ ] Toasts en todas las mutations (create / update / delete) con copy en español
- [ ] Spinner en submits + estados disabled correctos
- [ ] QA mobile: viewport real, safe-areas, scroll, bottom nav no tape contenido

#### Pendientes / Refinements

- [ ] **Crear tostador desde el formulario de nuevo café** — planificar en próxima sesión. Flujo propuesto: botón "+ Nuevo tostador" junto al selector, abre un modal/sheet inline con el `RoasterForm`, y al crear redirige de vuelta al formulario de café con el nuevo tostador pre-seleccionado.
