# Supabase Integration Plan
## USPTO Patent Filing Assistant → Enterprise SaaS

---

## Current Architecture (Phase 1 — Personal Tool)

- **State:** React `useState` + `localStorage`
- **Auth:** None (single user)
- **Data:** Browser-local only
- **AI:** Direct Anthropic API calls from browser

This is intentional for a personal productivity tool. When you're ready to
turn this into a multi-user SaaS, follow the migration path below.

---

## Phase 2 — Supabase Migration (Multi-User SaaS)

### What Supabase Adds

| Feature | Personal (now) | SaaS (Supabase) |
|---------|---------------|-----------------|
| Data persistence | localStorage | PostgreSQL (permanent) |
| Multi-user | ❌ Single user | ✅ Unlimited orgs/users |
| Auth | ❌ None | ✅ Email, Google, GitHub, SSO |
| Row-level security | ❌ | ✅ Users only see their data |
| API key security | ⚠️ Exposed in browser | ✅ Server-side Edge Functions |
| Audit trail | ❌ | ✅ Full activity log |
| Team sharing | ❌ | ✅ Org-level access |

### Database Schema (Ready to deploy)

```sql
-- Organizations (law firms, inventor teams, companies)
create table organizations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  plan         text not null default 'free',   -- free | pro | enterprise
  created_at   timestamptz default now()
);

-- Users
create table profiles (
  id           uuid primary key references auth.users,
  org_id       uuid references organizations(id),
  role         text not null default 'inventor',  -- inventor | attorney | admin
  full_name    text,
  created_at   timestamptz default now()
);

-- Patent portfolio
create table patents (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid references organizations(id) not null,
  patent_id    text not null,        -- PA-1, PA-2, etc.
  title        text not null,
  status       text not null default 'planned',
  filed_date   date,
  app_number   text default '',
  deadline     date,
  priority     int default 2,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Filing wizard sessions (saves progress)
create table wizard_sessions (
  id           uuid primary key default gen_random_uuid(),
  patent_id    uuid references patents(id) not null,
  user_id      uuid references profiles(id),
  step         int not null default 1,
  doc_input    text default '',
  ai_data      jsonb,
  cover_data   jsonb,
  checks       jsonb default '{}',
  valid_result jsonb,
  app_num      text default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Row-level security: users only see their org's data
alter table patents enable row level security;
create policy "Org members see own patents"
  on patents for all
  using (org_id = (select org_id from profiles where id = auth.uid()));

alter table wizard_sessions enable row level security;
create policy "User sees own sessions"
  on wizard_sessions for all
  using (user_id = auth.uid());
```

### Edge Function for API Key Security

Move the Anthropic API call server-side so the key is never exposed:

```typescript
// supabase/functions/claude-extract/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { specText, task } = await req.json()
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,  // server-side only
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, ... })
  })
  
  return new Response(await res.text(), { headers: { 'Content-Type': 'application/json' } })
})
```

### Migration Steps (when ready)

```bash
# 1. Create Supabase project at supabase.com
# 2. Run the schema above in the SQL editor
# 3. Install client
npm install @supabase/supabase-js

# 4. Add env vars
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Replace usePortfolio hook to read/write from Supabase
# 6. Add auth UI (Supabase Auth UI component)
# 7. Move Claude API calls to Edge Functions
# 8. Deploy Edge Functions: supabase functions deploy claude-extract
```

---

## Your Supabase Token

You have a Supabase service role token in your credentials. To use it:

1. Go to `supabase.com` → create a new project
2. Run the schema SQL above
3. Get your project URL and anon key from Settings → API
4. Add to Vercel environment variables
5. Come back here and say "migrate to Supabase" — I'll update the hooks

---

## SaaS Pricing Model (when ready)

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 1 user, 3 patents, 10 AI analyses/mo |
| Pro | $49/mo | 5 users, unlimited patents, 100 AI analyses/mo |
| Enterprise | $299/mo | Unlimited users, white-label, dedicated support |
