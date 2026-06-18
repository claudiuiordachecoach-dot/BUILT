# Poze de profil + upload + greutate — Design

_2026-06-19_

## Scop
Poze de profil pentru coach și clienți, upload real de pe telefon (nu link),
galerie de progres cu upload, și greutatea actuală cu grafic de evoluție.

## Decizii
- Upload real prin **Supabase Storage** (bucket public `uploads`), nu lipit URL.
- Avatar coach apare în antetul chat-ului clientului + dashboard (acum text hardcodat).
- Greutatea actuală + grafic calculate din `clients.progress_gallery` (nu tabel nou).

## Componente

### 1. Storage
- Bucket public `uploads`, foldere `avatars/`, `progress/`, `coach/`.
- Creat de mine via REST (service role).
- Politici (DDL manual de Claudiu): read public; write doar utilizatori autentificați.
- Componentă reutilizabilă `ImageUpload` (client): input `accept="image/*"`,
  preview, urcă în bucket, întoarce URL public.

### 2. Avatar client
- Coloană `clients.avatar_url text`.
- UI sus în `/client/profil`: avatar + „Schimbă poza" (ImageUpload).
- Afișat în `/client/mesaje`, `/client/dashboard` (înlocuiește inițialele).
- Server action `saveClientAvatar(url)`.

### 3. Avatar coach
- Tabel `app_settings (key text primary key, value text, updated_at)`.
- Cheia `coach_avatar_url`.
- Secțiune „Profil Coach" în admin (`/clienti` sau `/dashboard`) cu ImageUpload.
- Antetul chat din `/client/mesaje` citește `coach_avatar_url` (fallback la inițiale).
- Server actions `getCoachAvatar()`, `saveCoachAvatar(url)`.

### 4. Galerie progres → upload
- Înlocuiesc inputul „Lipește link URL" cu `ImageUpload` în `ProgressGallery.tsx`.
- Restul (kg, dată, label, salvare în `progress_gallery`) rămâne.

### 5. Greutate actuală + grafic
- Calcul din `progress_gallery`: ultima intrare = greutate actuală;
  prima = start; delta = actuală − start.
- Titlu „72 kg · −8 kg de la start" pe `/client/profil` (și/sau dashboard).
- Grafic simplu de linie cu `recharts` (deja instalat) pe intrările sortate după dată.

## DDL manual (un singur bloc pentru SQL Editor)
- `alter table clients add column if not exists avatar_url text;`
- `create table if not exists app_settings (...);`
- Politici storage pentru bucket `uploads`.

## Out of scope (rundă următoare)
Streak check-in, leaderboard, badge-uri, obiectiv greutate cu bară, înainte/după.

## Deploy
Cod prin git push → Vercel. Bucket creat de mine. DDL rulat de Claudiu.
