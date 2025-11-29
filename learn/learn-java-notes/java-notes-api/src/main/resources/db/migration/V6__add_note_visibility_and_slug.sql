-- Add visibility, slug, and public_id columns to study_notes
ALTER TABLE study_notes
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS public_id VARCHAR(20);

-- Create unique index for slug per user
CREATE UNIQUE INDEX IF NOT EXISTS ix_study_notes_user_slug 
ON study_notes (user_id, slug) 
WHERE slug IS NOT NULL;

-- Create unique index for public_id
CREATE UNIQUE INDEX IF NOT EXISTS ix_study_notes_public_id 
ON study_notes (public_id) 
WHERE public_id IS NOT NULL;

-- Create index for visibility queries
CREATE INDEX IF NOT EXISTS ix_study_notes_visibility 
ON study_notes (visibility);

-- Create composite index for public feed queries
CREATE INDEX IF NOT EXISTS ix_study_notes_visibility_created 
ON study_notes (visibility, created_at DESC);

-- Create composite index for visibility + updated_at (for trending)
CREATE INDEX IF NOT EXISTS ix_study_notes_visibility_updated 
ON study_notes (visibility, updated_at DESC);

-- ============ Related Tables Updates ============

-- Ensure note_views table has proper indexes for visibility-based queries
CREATE INDEX IF NOT EXISTS idx_note_views_note_visibility 
ON note_views (note_id) 
WHERE is_public_view = true;

-- Ensure attachments table has proper indexes for public access
-- (Already exists: idx_attachments_note_id_public)
-- Add index for visibility-based attachment queries
CREATE INDEX IF NOT EXISTS idx_attachments_public_uploaded 
ON attachments (is_public, uploaded_at DESC);

-- Add constraint to ensure private notes don't have public attachments
-- This is enforced at application level, but document the rule
COMMENT ON COLUMN attachments.is_public IS 'Whether attachment is publicly accessible. Must be false if parent note visibility is PRIVATE.';

-- Add comment on visibility column
COMMENT ON COLUMN study_notes.visibility IS 'Note visibility level: PRIVATE (owner only), UNLISTED (link only), PUBLIC (searchable), FEATURED (highlighted)';
COMMENT ON COLUMN study_notes.slug IS 'URL-friendly slug for public sharing. Unique per user when note is public/unlisted.';
COMMENT ON COLUMN study_notes.public_id IS 'Short unique ID for public sharing URLs. Format: /p/{publicId}/{slug}';

-- Ensure cascade delete still works for related tables
-- note_views: Already has ON DELETE CASCADE
-- attachments: Already has ON DELETE CASCADE
-- tags (many-to-many): Already has ON DELETE CASCADE
