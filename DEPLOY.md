# Deploy pe Vercel — 3 pași

## Pas 1: Login (o singură dată)
```bash
cd "built-ai-command-center"
npx vercel login
```
Se deschide browser-ul. Autentifică-te cu contul tău Vercel (sau creează unul gratuit la vercel.com).

## Pas 2: Deploy
```bash
npx vercel --prod
```
Prima dată te întreabă:
- "Set up and deploy?" → **Y**
- "Which scope?" → alege contul tău
- "Link to existing project?" → **N** (prima dată)
- "Project name?" → `built-command-center` (sau orice vrei)
- "In which directory is your code located?" → **./` (Enter)
- Framework auto-detectat: **Next.js** → confirmă

## Pas 3: Adaugă variabilele de mediu
```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add ANTHROPIC_API_KEY production
```
Fiecare comandă cere valoarea — copiaz-o din `.env.local`.

## Pas 4: Redeploy cu env vars
```bash
npx vercel --prod
```

## Alternativă: Dashboard Vercel
Dacă preferi UI: vercel.com → proiectul tău → Settings → Environment Variables → adaugă cele 3 variabile.

## URL-ul final
Vercel îți dă un URL de forma: `https://built-command-center-xxxx.vercel.app`
Poți adăuga un domeniu custom din Settings → Domains.
