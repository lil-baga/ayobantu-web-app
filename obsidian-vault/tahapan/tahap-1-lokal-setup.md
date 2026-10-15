# Tahap 1: Lokal Setup

## Deskripsi
Inisialisasi proyek Next.js lokal, setup environment, konfigurasi linting, pastikan build berjalan.

## Requirements
- ✅ Next.js 16.4.1 dengan TypeScript, Tailwind CSS
- ✅ Environment variables (.env.local)
- ✅ ESLint & Prettier config
- ✅ Supabase CLI lokal
- ✅ Build & dev server berjalan

## Deliverables
- ✅ `next.config.ts` - Next.js config
- ✅ `.env.local` - Environment variables (lokal values)
- ✅ `.eslintrc.json` - Linting rules
- ✅ `tsconfig.json` - TypeScript config
- ✅ `tailwind.config.ts` - Tailwind CSS
- ✅ `package.json` - Dependencies & scripts

## Implementation

### Completed
- ✅ Next.js 16.4.1 init dengan TypeScript, React 19, Tailwind
- ✅ Supabase SDK installed (@supabase/ssr, @supabase/supabase-js)
- ✅ ESLint configured dengan eslint-config-next
- ✅ Tailwind CSS v4 dengan TurboCSS
- ✅ Node module aliases (@/ → src/)
- ✅ Supabase CLI installed & configured lokal
- ✅ npm scripts: dev, build, start, lint, db:reset, supabase:*

## Testing Steps

1. **Dev Server**
   ```bash
   npm run dev
   ```
   - Server start di http://localhost:3000
   - Halaman landing (/) bisa diakses
   - Tidak ada runtime errors di console

2. **Build**
   ```bash
   npm run build
   ```
   - Build pass tanpa errors (warnings boleh)
   - Output: `.next/` folder ter-generate

3. **Lint**
   ```bash
   npm run lint
   ```
   - Scan semua files, report issues (warna merah = error, kuning = warning)

## Related Files
- `next.config.ts`
- `.env.local`
- `.eslintrc.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `package.json`

## Decisions & Notes
- Node 20.11.1 (lokal setup; production target Node 22+)
- Supabase lokal mode: data stored di `.supabase/` (git-ignored)
- Build target: standalone (siap untuk deployment)

## Links
- [[Tahap 2: Database & Auth]]
