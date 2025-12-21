-- Create search_analytics table for tracking search behavior
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query VARCHAR(500) NOT NULL,
    user_id UUID REFERENCES users(id),
    result_count INTEGER DEFAULT 0,
    clicked_note_id UUID REFERENCES study_notes(id),
    click_position INTEGER,
    search_duration_ms BIGINT DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public_search BOOLEAN DEFAULT FALSE,
    tags_used TEXT,
    has_attachment_filter BOOLEAN,
    sort_option VARCHAR(50)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_query ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_timestamp ON search_analytics(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_user ON search_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_search_public ON search_analytics(is_public_search);
CREATE INDEX IF NOT EXISTS idx_search_clicked_note ON search_analytics(clicked_note_id);
