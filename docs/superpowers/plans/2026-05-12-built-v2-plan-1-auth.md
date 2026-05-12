# BUILT v2 — Plan 1: Auth + DB Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Supabase Auth cu roluri admin/client, middleware de protecție rute, login page, sidebar cu sign out real, și toate tabelele DB noi.

**Architecture:** @supabase/ssr pentru cookies-based auth în Next.js App Router. Middleware verifică sesiunea pe fiecare request. Roluri stocate în `profiles` table legat de `auth.users`.

**Tech Stack:** Next.js 16 App Router, @supabase/ssr, Supabase Auth, TypeScript, Tailwind

---

## File Map

- **Create:** `middleware.ts` — route protection la nivel de request
- **Create:** `src/lib/supabase/auth-server.ts` — createServerClient cu cookies
- **Create:** `src/lib/supabase/auth-client.ts` — createBrowserClient
- **Modify:** `src/lib/supabase/server.ts` — păstrăm pentru operații fără auth
- **Create:** `src/app/login/page.tsx` — pagina de login
- **Create:** `src/app/login/actions.ts` — signIn/signOut server actions
- **Modify:** `src/components/Sidebar.tsx` — user real + sign out
- **Modify:** `src/app/layout.tsx` — wrap cu auth context
- **Create:** `supabase/migrations/001_auth_schema.sql` — profiles + toate tabelele noi

---

### Task 1: Instalare dependențe

**Files:** `package.json`

- [ ] **Step 1: Instalează @supabase/ssr**

```bash
cd "built-ai-command-center" && npm install @supabase/ssr
```

Expected output: `added 1 package`

- [ ] **Step 2: Verifică instalarea**

```bash
node -e "require('@supabase/ssr'); console.log('ok')"
```

Expected: `ok`

---

### Task 2: DB Schema — toate tabelele noi

**Files:**
- Create: `supabase/migrations/001_auth_schema.sql`

- [ ] **Step 1: Creează fișierul de migrare**

Conținut complet `supabase/migrations/001_auth_schema.sql`:

```sql
-- ══════════════════════════════════════════
-- PROFILES (legat de auth.users)
-- ══════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('admin', 'client')),
  full_name text,
  avatar_initials text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- ══════════════════════════════════════════
-- AI CONVERSATIONS
-- ══════════════════════════════════════════
create table if not exists public.ai_conversations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  source text not null check (source in (
    'ask_built_ai','dm_coach','reels','stories',
    'carusele','claude_import','gemini_import'
  )),
  title text,
  messages jsonb not null default '[]'::jsonb,
  summary text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists ai_conv_user_idx on public.ai_conversations (user_id, created_at desc);

alter table public.ai_conversations enable row level security;
create policy "Users see own convos" on public.ai_conversations
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- INSTAGRAM MEDIA (reels proprii)
-- ══════════════════════════════════════════
create table if not exists public.instagram_media (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  instagram_id text unique,
  thumbnail_url text,
  caption text,
  format_type text check (format_type in (
    'TALKING_HEAD','RANT','TREND','TUTORIAL',
    'STORY_TIME','LIST','BEHIND_SCENES','OTHER'
  )),
  views int default 0,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  shares int default 0,
  posted_at timestamptz,
  analysis jsonb,
  created_at timestamptz default now()
);

create index if not exists ig_media_user_idx on public.instagram_media (user_id, posted_at desc);

alter table public.instagram_media enable row level security;
create policy "Users see own media" on public.instagram_media
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- WEEKLY PACKAGES (scripturi săptămânale)
-- ══════════════════════════════════════════
create table if not exists public.weekly_packages (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  intelligence_report jsonb,
  scripts jsonb default '[]'::jsonb,
  generated_at timestamptz default now()
);

create index if not exists weekly_pkg_user_idx on public.weekly_packages (user_id, week_start desc);

alter table public.weekly_packages enable row level security;
create policy "Users see own packages" on public.weekly_packages
  for all using (auth.uid() = user_id);

-- ══════════════════════════════════════════
-- WORKOUT PLANS
-- ══════════════════════════════════════════
create table if not exists public.workout_plans (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  week_start date not null,
  days jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists workout_client_idx on public.workout_plans (client_id, week_start desc);

alter table public.workout_plans enable row level security;
create policy "Allow all workout_plans" on public.workout_plans for all using (true) with check (true);

drop trigger if exists trg_workout_updated_at on public.workout_plans;
create trigger trg_workout_updated_at
  before update on public.workout_plans
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════
-- NUTRITION PLANS
-- ══════════════════════════════════════════
create table if not exists public.nutrition_plans (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  meals jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists nutrition_client_idx on public.nutrition_plans (client_id);

alter table public.nutrition_plans enable row level security;
create policy "Allow all nutrition_plans" on public.nutrition_plans for all using (true) with check (true);

drop trigger if exists trg_nutrition_updated_at on public.nutrition_plans;
create trigger trg_nutrition_updated_at
  before update on public.nutrition_plans
  for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════
-- CLIENT MESSAGES
-- ══════════════════════════════════════════
create table if not exists public.client_messages (
  id bigserial primary key,
  client_id bigint not null references public.clients(id) on delete cascade,
  sender text not null check (sender in ('admin','client')),
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists msg_client_idx on public.client_messages (client_id, created_at desc);

alter table public.client_messages enable row level security;
create policy "Allow all client_messages" on public.client_messages for all using (true) with check (true);

-- ══════════════════════════════════════════
-- CLIENTS — adaugă coloana auth_user_id
-- ══════════════════════════════════════════
alter table public.clients add column if not exists auth_user_id uuid references auth.users(id);
create index if not exists clients_auth_user_idx on public.clients (auth_user_id);

-- ══════════════════════════════════════════
-- TIP OF THE WEEK (stocat în creier_metadata)
-- key = 'tip_of_week', value = {text, generated_at}
-- Tabelul există deja — nu recreăm
-- ══════════════════════════════════════════

notify pgrst, 'reload schema';
```

- [ ] **Step 2: Rulează în Supabase SQL Editor**

Deschide Supabase Dashboard → SQL Editor → New Query → paste conținutul de mai sus → Run.

Expected: toate tabelele create fără erori.

- [ ] **Step 3: Verifică în Table Editor**

În Supabase Dashboard → Table Editor, verifică că există: `profiles`, `ai_conversations`, `instagram_media`, `weekly_packages`, `workout_plans`, `nutrition_plans`, `client_messages`.

---

### Task 3: Supabase auth clients (SSR-aware)

**Files:**
- Create: `src/lib/supabase/auth-server.ts`
- Create: `src/lib/supabase/auth-client.ts`

- [ ] **Step 1: Creează auth-server.ts**

```typescript
// src/lib/supabase/auth-server.ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseAuth() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = await getSupabaseAuth();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUserRole(): Promise<'admin' | 'client' | null> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return (data?.role as 'admin' | 'client') ?? null;
}
```

- [ ] **Step 2: Creează auth-client.ts**

```typescript
// src/lib/supabase/auth-client.ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

### Task 4: Middleware de protecție rute

**Files:**
- Create: `middleware.ts` (în root, lângă `package.json`)

- [ ] **Step 1: Creează middleware.ts**

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Rute publice — nu necesită auth
  if (pathname.startsWith('/login') || pathname.startsWith('/api')) {
    return supabaseResponse;
  }

  // Neautentificat → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Dacă e client și încearcă să acceseze rute admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? 'client';

  if (role === 'client' && !pathname.startsWith('/client')) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url));
  }

  if (role === 'admin' && pathname.startsWith('/client')) {
    return NextResponse.redirect(new URL('/dashboard/analytics', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 2: Verifică că dev server pornește fără erori**

```bash
cd "built-ai-command-center" && npm run dev 2>&1 | head -20
```

Expected: `Ready in Xms` fără erori TypeScript.

---

### Task 5: Login page + server actions

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`

- [ ] **Step 1: Creează actions.ts**

```typescript
// src/app/login/actions.ts
"use server";
import { redirect } from "next/navigation";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user!.id)
    .single();

  if (profile?.role === 'client') redirect('/client/dashboard');
  redirect('/dashboard/analytics');
}

export async function signOut() {
  const supabase = await getSupabaseAuth();
  await supabase.auth.signOut();
  redirect('/login');
}
```

- [ ] **Step 2: Creează login/page.tsx**

```typescript
// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { signIn } from "./actions";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandLogo variant="full" showTagline={false} />
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Intră în cont</h1>
          <p className="text-sm text-zinc-500 mb-6">BUILT AI Command Center</p>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                placeholder="email@tau.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Parolă</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-all"
            >
              {loading ? "Se conectează..." : "Intră"}
            </button>
          </form>
        </div>
        <p className="text-center text-[11px] text-zinc-700 mt-6">
          BUILT AI Command Center · v0.2
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Testează manual**

Pornește dev server, accesează `http://localhost:3000`. Trebuie redirecționat la `/login`.

---

### Task 6: Sidebar cu auth real

**Files:**
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Adaugă SignOutButton component**

Creează `src/components/SignOutButton.tsx`:

```typescript
// src/components/SignOutButton.tsx
"use client";
import { getSupabaseClient } from "@/lib/supabase/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function handleSignOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  }
  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all w-full"
    >
      <span className="text-zinc-600">↪</span> Sign Out
    </button>
  );
}
```

- [ ] **Step 2: Adaugă UserDisplay component**

Creează `src/components/UserDisplay.tsx`:

```typescript
// src/components/UserDisplay.tsx
"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/auth-client";

export function UserDisplay() {
  const [name, setName] = useState("...");
  const [role, setRole] = useState("...");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('full_name,role').eq('id', user.id).single()
        .then(({ data }) => {
          const n = data?.full_name ?? user.email ?? "User";
          setName(n);
          setRole(data?.role === 'admin' ? 'Admin' : 'Client');
          setInitials(n.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase());
        });
    });
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-built-red flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-zinc-200 truncate">{name}</div>
        <div className="text-[10px] text-zinc-500">{role}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Actualizează Sidebar.tsx — înlocuiește secțiunea de profil hardcodat și adaugă Sign Out**

În `src/components/Sidebar.tsx`, înlocuiește:
```typescript
import { BrandLogo } from "./BrandLogo";
```
cu:
```typescript
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";
```

Înlocuiește blocul hardcodat cu inițialele `IC`:
```typescript
        <div className="mt-4 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-built-red flex items-center justify-center text-[10px] font-bold text-white">
            IC
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-zinc-200 truncate">
              Iordache Claudiu
            </div>
            <div className="text-[10px] text-zinc-500">Admin</div>
          </div>
        </div>
```
cu:
```typescript
        <div className="mt-4">
          <UserDisplay />
        </div>
```

Înlocuiește footer-ul:
```typescript
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-zinc-600">
          <span className="w-1.5 h-1.5 rounded-full bg-built-red" />
          <span className="text-[10px] font-mono">v0.1 · BUILT AI</span>
        </div>
      </div>
```
cu:
```typescript
      <div className="p-3 border-t border-white/10 space-y-1">
        <SignOutButton />
        <div className="flex items-center gap-2 text-zinc-600 px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-built-red" />
          <span className="text-[10px] font-mono">v0.2 · BUILT AI</span>
        </div>
      </div>
```

- [ ] **Step 4: Testează**

Loghează-te cu un user existent din Supabase (sau creează unul manual în Dashboard → Authentication → Users → Add User). Verifică că sidebar-ul afișează numele și rolul real, și că Sign Out funcționează.

- [ ] **Step 5: Creează admin user în Supabase**

În Supabase Dashboard → Authentication → Users → Add User:
- Email: `claudiu@built.ro` (sau email-ul tău)
- Password: una sigură

Apoi în SQL Editor:
```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'claudiu@built.ro'
);
```

- [ ] **Step 6: Commit**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: auth system — supabase auth, middleware, login page, sidebar upgrade"
```

---

### Task 7: Creează admin primul client din UI

Aceasta e o verificare end-to-end a auth-ului cu roluri.

- [ ] **Step 1: Loghează-te ca admin**

Accesează `http://localhost:3000`, loghează-te cu contul de admin. Verifică redirect la `/dashboard/analytics`.

- [ ] **Step 2: Adaugă un client test**

Mergi la `/clienti` → New Client, adaugă un client de test. Notează ID-ul lui.

- [ ] **Step 3: Creează user pentru client în Supabase**

În Supabase Dashboard → Auth → Add User:
- Email: `client.test@test.com`
- Password: `test1234`

Apoi în SQL Editor:
```sql
update public.clients 
set auth_user_id = (select id from auth.users where email = 'client.test@test.com')
where name = 'Numele clientului tău de test';
```

- [ ] **Step 4: Testează login ca client**

Deschide incognito → `http://localhost:3000` → loghează-te cu `client.test@test.com` / `test1234`.
Expected: redirect automat la `/client/dashboard` (pagina nu există încă — va afișa 404, dar redirect-ul e corect).

---

Plan 1 complet. Continuă cu Plan 2 (features) și Plan 3 (portal clienți).
