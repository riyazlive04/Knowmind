-- Add submission.member_id to link assessment submissions to a member/lead.
-- (2026-07-01)
--
-- The canonical schema (001) already defines this column, but the live database
-- was created without it. This migration brings the live DB in sync so the
-- lead-capture → member → submission link works.
--
-- ON DELETE SET NULL (not CASCADE): removing a member should not delete their
-- historical submissions. member_id is nullable/optional.

ALTER TABLE submission
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES member(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_submission_member_id ON submission (member_id);

-- Ask PostgREST (Supabase REST) to refresh its schema cache so the new column
-- is immediately usable via the API.
NOTIFY pgrst, 'reload schema';
