# DATABASE — Proposed Supabase PostgreSQL Schema
## USPTO Patent Filing Assistant | Visionary AI Systems, Inc.
## April 4, 2026

---

## Overview

This document defines the complete database schema for migrating from localStorage
to Supabase PostgreSQL. All tables include RLS policies for multi-tenant data isolation.

**Supabase project:** To be created (Phase 1)
**Database:** PostgreSQL 15+ (Supabase managed)
**Auth:** Supabase Auth (email/password + Google OAuth)
**Storage:** Supabase Storage for DOCX/PDF files

---

## Schema Diagram

```
organizations (1) ──── (N) profiles
      │                      │
      │                      │ (N)
      ├──── (N) patents ─────┼──── (N) patent_documents
      │           │          │          │
      │           │          │          └──── Supabase Storage
      │           │          │
      │           ├──── (N) wizard_sessions
      │           │
      │           └──── (N) filing_receipts
      │
      ├──── (N) inventor_profiles
      │
      ├──── (N) assignee_profiles
      │
      ├──── (N) audit_log
      │
      └──── (N) feature_flags

voice_sessions (standalone, user-scoped)
```

---

## Table Definitions

### 1. organizations

Multi-tenant organization container.

```sql
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL DEFAULT 'company'
              CHECK (type IN ('company', 'law_firm', 'individual', 'university')),
  address     TEXT,
  state_of_inc TEXT,           -- e.g., 'Delaware'
  state_id    TEXT,            -- e.g., '10468520'
  ein         TEXT,            -- e.g., '41-3757112'
  entity_status TEXT NOT NULL DEFAULT 'Small Entity'
              CHECK (entity_status IN ('Small Entity', 'Large Entity', 'Micro Entity')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: Visionary AI Systems, Inc.
INSERT INTO organizations (name, slug, type, address, state_of_inc, state_id, ein)
VALUES (
  'Visionary AI Systems, Inc.',
  'visionary-ai',
  'company',
  '1102 Cool Springs Drive, Kennesaw, GA 30144',
  'Delaware',
  '10468520',
  '41-3757112'
);
```

### 2. profiles

User profiles linked to Supabase Auth. One user belongs to one org.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'inventor'
              CHECK (role IN ('super_admin', 'org_admin', 'patent_manager', 'inventor', 'viewer')),
  avatar_url  TEXT,
  preferences JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, org_id, full_name, email)
  VALUES (
    NEW.id,
    (SELECT id FROM organizations LIMIT 1),  -- Default org for Phase 1
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. patents

Patent portfolio with org isolation.

```sql
CREATE TABLE patents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  patent_id   TEXT NOT NULL,              -- 'PA-1', 'PA-2', etc.
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'ready', 'filing', 'filed', 'prosecution', 'granted', 'abandoned')),
  priority    INTEGER NOT NULL DEFAULT 2
              CHECK (priority BETWEEN 1 AND 3),
  app_number  TEXT,                       -- '64/029,100'
  filed_date  DATE,
  deadline    DATE,                       -- Nonprovisional deadline
  spec_text   TEXT,                       -- Full specification text
  entity_status TEXT DEFAULT 'Small Entity',
  filing_fee  NUMERIC(10, 2),
  metadata    JSONB DEFAULT '{}',
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (org_id, patent_id)
);

-- Seed PA-1 through PA-7 for Visionary AI
-- (Run after org is created; patent_id values match existing PORTFOLIO_INIT)
```

### 4. patent_documents

File metadata for documents associated with patents.
Actual files stored in Supabase Storage.

```sql
CREATE TABLE patent_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_id   UUID NOT NULL REFERENCES patents(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id),
  doc_type    TEXT NOT NULL
              CHECK (doc_type IN (
                'specification', 'cover_sheet', 'drawing',
                'assignment', 'disclosure', 'receipt',
                'office_action', 'response', 'other'
              )),
  uspto_label TEXT,                       -- 'Specification', 'Provisional Cover Sheet (SB16)', 'Drawings'
  file_name   TEXT NOT NULL,
  file_path   TEXT NOT NULL,              -- Supabase Storage path
  file_size   INTEGER,
  mime_type   TEXT,
  version     INTEGER NOT NULL DEFAULT 1,
  is_current  BOOLEAN NOT NULL DEFAULT true,
  generated_by TEXT DEFAULT 'manual'      -- 'manual', 'ai', 'import'
              CHECK (generated_by IN ('manual', 'ai', 'import')),
  metadata    JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patent_documents_patent ON patent_documents(patent_id);
CREATE INDEX idx_patent_documents_type ON patent_documents(doc_type);
```

### 5. wizard_sessions

Save/resume wizard progress per user per patent.

```sql
CREATE TABLE wizard_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  patent_id   UUID NOT NULL REFERENCES patents(id),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  step        INTEGER NOT NULL DEFAULT 1
              CHECK (step BETWEEN 1 AND 6),
  doc_input   TEXT,                       -- Pasted/uploaded spec text
  ai_data     JSONB,                      -- ExtractedFilingData
  cover_data  JSONB,                      -- CoverSheetData
  checks      JSONB DEFAULT '{}',         -- Checklist state
  valid_result JSONB,                     -- ValidationResult
  app_number  TEXT,
  completed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, patent_id)
);
```

### 6. inventor_profiles

Reusable inventor data for auto-population.

```sql
CREATE TABLE inventor_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  full_name   TEXT NOT NULL,
  address     TEXT NOT NULL,              -- Full mailing address
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  zip         TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'United States',
  citizenship TEXT NOT NULL DEFAULT 'United States',
  email       TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: Milton & Lisa Overton
-- INSERT INTO inventor_profiles (org_id, full_name, address, city, state, zip, is_primary)
-- VALUES
--   (:org_id, 'Milton Overton', '1102 Cool Springs Drive', 'Kennesaw', 'GA', '30144', true),
--   (:org_id, 'Lisa Overton', '1102 Cool Springs Drive', 'Kennesaw', 'GA', '30144', false);
```

### 7. assignee_profiles

Reusable assignee data.

```sql
CREATE TABLE assignee_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  name        TEXT NOT NULL,
  address     TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Corporation'
              CHECK (type IN ('Corporation', 'LLC', 'Partnership', 'Individual', 'Trust', 'Other')),
  state_of_inc TEXT,
  state_id    TEXT,
  ein         TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: Visionary AI Systems, Inc.
-- INSERT INTO assignee_profiles (org_id, name, address, type, state_of_inc, state_id, ein, is_default)
-- VALUES (:org_id, 'Visionary AI Systems, Inc.', '1102 Cool Springs Drive, Kennesaw, GA 30144',
--         'Corporation', 'Delaware', '10468520', '41-3757112', true);
```

### 8. filing_receipts

Archived filing confirmations from USPTO.

```sql
CREATE TABLE filing_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patent_id       UUID NOT NULL REFERENCES patents(id),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  app_number      TEXT NOT NULL,          -- '64/029,100'
  confirmation_no TEXT,
  filing_date     DATE NOT NULL,
  entity_status   TEXT NOT NULL,
  fee_paid        NUMERIC(10, 2),
  receipt_url     TEXT,                   -- Supabase Storage path to receipt PDF
  metadata        JSONB DEFAULT '{}',
  recorded_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_filing_receipts_app ON filing_receipts(app_number);
```

### 9. audit_log

All significant actions with user attribution.
Maps to PA-5 HAL authorization audit log (component 340).

```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  -- Action categories:
  -- patent.create, patent.update, patent.file, patent.delete
  -- document.generate, document.upload, document.download
  -- wizard.start, wizard.complete
  -- voice.query, voice.action_proposed, voice.action_approved, voice.action_rejected
  -- auth.login, auth.logout, auth.invite, auth.role_change
  -- admin.feature_flag_toggle, admin.settings_change
  resource_type TEXT,                     -- 'patent', 'document', 'wizard', 'voice', etc.
  resource_id   UUID,                     -- ID of affected resource
  details       JSONB DEFAULT '{}',       -- Action-specific data
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
```

### 10. feature_flags

Database-driven feature flags with scope hierarchy.

```sql
CREATE TABLE feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key    TEXT NOT NULL,
  scope       TEXT NOT NULL DEFAULT 'global'
              CHECK (scope IN ('global', 'org', 'user')),
  scope_id    UUID,                       -- NULL for global, org_id for org, user_id for user
  enabled     BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (flag_key, scope, scope_id)
);

-- Seed default global flags
INSERT INTO feature_flags (flag_key, scope, enabled) VALUES
  ('voice_assistant_enabled', 'global', true),
  ('ai_analysis_enabled', 'global', true),
  ('docx_generation_enabled', 'global', false),
  ('drawing_generator_enabled', 'global', true),
  ('odp_api_integration', 'global', false),
  ('multi_patent_filing', 'global', false),
  ('admin_console_enabled', 'global', false),
  ('legal_docs_enabled', 'global', true),
  ('trademark_module_enabled', 'global', true),
  ('prior_art_search_enabled', 'global', true);

-- Flag resolution function: most specific scope wins
CREATE OR REPLACE FUNCTION get_feature_flag(
  p_flag_key TEXT,
  p_user_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Check user-level first
  IF p_user_id IS NOT NULL THEN
    SELECT enabled INTO result
    FROM feature_flags
    WHERE flag_key = p_flag_key AND scope = 'user' AND scope_id = p_user_id;
    IF FOUND THEN RETURN result; END IF;
  END IF;

  -- Check org-level
  IF p_org_id IS NOT NULL THEN
    SELECT enabled INTO result
    FROM feature_flags
    WHERE flag_key = p_flag_key AND scope = 'org' AND scope_id = p_org_id;
    IF FOUND THEN RETURN result; END IF;
  END IF;

  -- Fall back to global
  SELECT enabled INTO result
  FROM feature_flags
  WHERE flag_key = p_flag_key AND scope = 'global' AND scope_id IS NULL;

  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 11. voice_sessions

Voice conversation persistence for agent memory across sessions.

```sql
CREATE TABLE voice_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  org_id      UUID NOT NULL REFERENCES organizations(id),
  messages    JSONB NOT NULL DEFAULT '[]',
  -- Each message: { role, text, agent, timestamp }
  agent_state JSONB DEFAULT '{}',
  -- Persisted agent context: last patent discussed, pending actions, etc.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_voice_sessions_user ON voice_sessions(user_id);
```

---

## Row-Level Security Policies

All tables enforce org-level isolation. Users can only access data belonging
to their organization.

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wizard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's org_id
CREATE OR REPLACE FUNCTION auth_org_id() RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: users can read their own org
CREATE POLICY "org_read" ON organizations
  FOR SELECT USING (id = auth_org_id());

-- Profiles: users can read profiles in their org
CREATE POLICY "profiles_read" ON profiles
  FOR SELECT USING (org_id = auth_org_id());

-- Profiles: users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Patents: full CRUD within own org
CREATE POLICY "patents_read" ON patents
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "patents_insert" ON patents
  FOR INSERT WITH CHECK (org_id = auth_org_id());

CREATE POLICY "patents_update" ON patents
  FOR UPDATE USING (org_id = auth_org_id());

-- Patent Documents: CRUD within own org
CREATE POLICY "docs_read" ON patent_documents
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "docs_insert" ON patent_documents
  FOR INSERT WITH CHECK (org_id = auth_org_id());

-- Wizard Sessions: users see their own sessions
CREATE POLICY "wizard_read" ON wizard_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "wizard_insert" ON wizard_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "wizard_update" ON wizard_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Inventor Profiles: org-scoped
CREATE POLICY "inventors_read" ON inventor_profiles
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "inventors_insert" ON inventor_profiles
  FOR INSERT WITH CHECK (org_id = auth_org_id());

-- Assignee Profiles: org-scoped
CREATE POLICY "assignees_read" ON assignee_profiles
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "assignees_insert" ON assignee_profiles
  FOR INSERT WITH CHECK (org_id = auth_org_id());

-- Filing Receipts: org-scoped
CREATE POLICY "receipts_read" ON filing_receipts
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "receipts_insert" ON filing_receipts
  FOR INSERT WITH CHECK (org_id = auth_org_id());

-- Audit Log: org-scoped read (admins only via app logic)
CREATE POLICY "audit_read" ON audit_log
  FOR SELECT USING (org_id = auth_org_id());

CREATE POLICY "audit_insert" ON audit_log
  FOR INSERT WITH CHECK (org_id = auth_org_id());

-- Feature Flags: global flags readable by all, org/user flags by scope
CREATE POLICY "flags_read_global" ON feature_flags
  FOR SELECT USING (
    scope = 'global'
    OR (scope = 'org' AND scope_id = auth_org_id())
    OR (scope = 'user' AND scope_id = auth.uid())
  );

-- Voice Sessions: user sees own sessions
CREATE POLICY "voice_read" ON voice_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "voice_insert" ON voice_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "voice_update" ON voice_sessions
  FOR UPDATE USING (user_id = auth.uid());
```

---

## Supabase Storage Buckets

```sql
-- Patent documents bucket (private, org-isolated)
INSERT INTO storage.buckets (id, name, public)
VALUES ('patent-documents', 'patent-documents', false);

-- Storage policy: users can access files in their org's folder
CREATE POLICY "patent_docs_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patent-documents'
    AND (storage.foldername(name))[1] = auth_org_id()::text
  );

CREATE POLICY "patent_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patent-documents'
    AND (storage.foldername(name))[1] = auth_org_id()::text
  );
```

**Folder structure:**
```
patent-documents/
  {org_id}/
    {patent_id}/
      specification/
        PA1-Complete-Provisional-Patent-DELAWARE-SPEC.docx
      cover_sheet/
        PA1-Cover-Sheet-PTO-SB-16-DELAWARE-LET.docx
      drawings/
        PA1-FIG-1-System-Architecture.pdf
        PA1-FIG-2-Voice-Processing-Pipeline.pdf
        PA1-FIG-3-Nine-Agent-Framework.pdf
        PA1-FIG-4-Communication-Failover.pdf
        PA1-FIG-5-RFE-Lead-Scoring.pdf
      receipts/
        PA1-Filing-Receipt-64-029-100.pdf
```

---

## Migration Plan

### Migration 001: Initial Schema
- Create all 11 tables
- Create RLS policies
- Create storage bucket
- Seed organizations, feature flags
- Create auth trigger

### Migration 002: Seed Patent Data
- Insert PA-1 through PA-7 from PORTFOLIO_INIT
- Insert inventor profiles (Milton, Lisa)
- Insert assignee profile (Visionary AI Systems)
- Insert PA-1 filing receipt (App #64/029,100)

### Migration 003: Indexes
- Create all performance indexes
- Create feature flag resolution function

### Data Migration from localStorage
- On first login after Phase 2 deploy:
  1. Read localStorage portfolio data
  2. Upsert patent records to database
  3. Clear localStorage (keep as fallback)
  4. Show migration success message

---

## Queries for Common Operations

### Get user's patent portfolio
```sql
SELECT p.*, fr.app_number, fr.filing_date AS receipt_date
FROM patents p
LEFT JOIN filing_receipts fr ON fr.patent_id = p.id
WHERE p.org_id = auth_org_id()
ORDER BY p.priority, p.patent_id;
```

### Get documents for a patent
```sql
SELECT * FROM patent_documents
WHERE patent_id = :patent_id AND is_current = true
ORDER BY doc_type;
```

### Get resolved feature flags for current user
```sql
SELECT
  ff.flag_key,
  get_feature_flag(ff.flag_key, auth.uid(), auth_org_id()) AS enabled
FROM (SELECT DISTINCT flag_key FROM feature_flags) ff;
```

### Get upcoming deadlines
```sql
SELECT patent_id, title, deadline,
  deadline - CURRENT_DATE AS days_remaining
FROM patents
WHERE org_id = auth_org_id()
  AND deadline IS NOT NULL
  AND deadline > CURRENT_DATE
ORDER BY deadline;
```

### Insert audit log entry
```sql
INSERT INTO audit_log (org_id, user_id, action, resource_type, resource_id, details)
VALUES (auth_org_id(), auth.uid(), 'patent.file', 'patent', :patent_id, :details);
```

---

*This schema is a proposal for Milton's review. No database will be created until approved.*
*Generated: April 4, 2026 by Claude Code*
