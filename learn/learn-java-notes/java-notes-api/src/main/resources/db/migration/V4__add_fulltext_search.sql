-- Migration V4: Add PostgreSQL full-text search capabilities
-- Creates tsvector column, GIN index, and trigger for automatic updates

-- Add search_vector column to study_notes table
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to generate search vector from note content
CREATE OR REPLACE FUNCTION notes_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS study_notes_search_vector_trigger ON study_notes;
CREATE TRIGGER study_notes_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, content ON study_notes
    FOR EACH ROW
    EXECUTE FUNCTION notes_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_study_notes_search_vector ON study_notes USING GIN(search_vector);

-- Update existing rows to populate search_vector
UPDATE study_notes SET 
    search_vector = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(content, '')), 'B');

-- Create function to get search headline (highlighted snippets)
CREATE OR REPLACE FUNCTION get_search_headline(content TEXT, query TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN ts_headline('english', content, plainto_tsquery('english', query),
        'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20, MaxFragments=2');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comments
COMMENT ON COLUMN study_notes.search_vector IS 'Full-text search vector combining title (weight A) and content (weight B)';
