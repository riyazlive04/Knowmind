-- Add lead-capture contact fields to member (2026-06-30)
-- The public assessment now collects name, email, and phone (with country code)
-- before the questionnaire. Email and country_code did not previously exist.

-- ============================================================================
-- 1. MEMBER TABLE - Add email + country_code (both nullable / optional)
-- ============================================================================
-- email: lead contact email captured at the assessment gate.
-- country_code: dial code (e.g. '+91') stored alongside the national `phone`.
--   `phone` itself remains UNIQUE and is stored in full E.164 form by the
--   lead route, so country_code is a convenience/display copy.
ALTER TABLE member
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Case-insensitive lookups / future de-dupe on email.
CREATE INDEX IF NOT EXISTS idx_member_email ON member (lower(email));

COMMENT ON COLUMN member.email IS 'Lead contact email captured at the public assessment gate. Nullable.';
COMMENT ON COLUMN member.country_code IS 'Dial code (e.g. +91) captured with phone at the assessment gate. Nullable; phone is stored in full E.164.';

-- ============================================================================
-- NOTE ON WRITE PATH
-- ============================================================================
-- Anon (public assessment) has SELECT-only on member (see 006). Member creation
-- for leads therefore happens server-side via the service_role key in the
-- /api/lead route (service_role_all_members policy already grants full access).
-- No anon INSERT policy is added here on purpose, to keep member writes
-- privileged.
