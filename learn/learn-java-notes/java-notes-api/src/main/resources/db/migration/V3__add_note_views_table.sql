-- Migration V3: Add note_views table for view tracking and analytics
-- This table stores view events for both public (anonymous) and private (authenticated) note access

CREATE TABLE IF NOT EXISTS note_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL,
    user_id UUID NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_public_view BOOLEAN NOT NULL DEFAULT true,
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    
    -- Foreign key constraints
    CONSTRAINT fk_note_views_note FOREIGN KEY (note_id) REFERENCES study_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_note_views_note_id ON note_views(note_id);
CREATE INDEX IF NOT EXISTS idx_note_views_user_id ON note_views(user_id);
CREATE INDEX IF NOT EXISTS idx_note_views_viewed_at ON note_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_note_views_is_public ON note_views(is_public_view);

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_note_views_note_date ON note_views(note_id, viewed_at);

-- Comment on table
COMMENT ON TABLE note_views IS 'Stores view events for note analytics. Tracks both anonymous (public) and authenticated (private) views.';
COMMENT ON COLUMN note_views.is_public_view IS 'True if viewed via public endpoint (anonymous), false if viewed by authenticated user';
COMMENT ON COLUMN note_views.ip_address IS 'Client IP address, used for anonymous view deduplication';
