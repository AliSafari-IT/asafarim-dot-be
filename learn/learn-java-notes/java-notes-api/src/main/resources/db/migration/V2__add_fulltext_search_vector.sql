-- Migration V2: Add full-text search support to study_notes
-- This enables PostgreSQL full-text search capabilities

-- Add search_vector column to study_notes
ALTER TABLE study_notes
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index on search_vector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_study_notes_search_vector ON study_notes USING GIN(search_vector);

-- Populate search_vector for existing records
UPDATE study_notes
SET search_vector = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
                    setweight(to_tsvector('english', COALESCE(content, '')), 'B')
WHERE search_vector IS NULL;

-- Create trigger to automatically update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_study_notes_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                       setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_study_notes_search_vector ON study_notes;
CREATE TRIGGER trigger_update_study_notes_search_vector
BEFORE INSERT OR UPDATE ON study_notes
FOR EACH ROW
EXECUTE FUNCTION update_study_notes_search_vector();
