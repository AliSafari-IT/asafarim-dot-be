-- Migration: Note-to-Note Citation Model (Knowledge Graph)
-- This migration converts from BibliographySource model to Note-to-Note citations
-- Version: 2
-- Date: 2024-11-30

-- ============================================================
-- Step 1: Add new columns to study_notes table
-- ============================================================

-- Academic/Publication metadata columns
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS authors TEXT;
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS publication_year INTEGER;
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS journal_name VARCHAR(255);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS publisher VARCHAR(255);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS pages VARCHAR(50);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS doi VARCHAR(100);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS url VARCHAR(500);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS isbn VARCHAR(20);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS issn VARCHAR(20);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS edition VARCHAR(50);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS volume VARCHAR(20);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS issue VARCHAR(20);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS accessed_date TIMESTAMP;
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS citation_key VARCHAR(100);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE NOT NULL;

-- ============================================================
-- Step 2: Create note_citations table (knowledge graph)
-- ============================================================

CREATE TABLE IF NOT EXISTS note_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL,
    referenced_note_id UUID NOT NULL,
    citation_order INTEGER,
    page_reference VARCHAR(50),
    inline_marker VARCHAR(100),
    context TEXT,
    first_position INTEGER,
    citation_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_note_citation_note FOREIGN KEY (note_id) 
        REFERENCES study_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_note_citation_referenced FOREIGN KEY (referenced_note_id) 
        REFERENCES study_notes(id) ON DELETE CASCADE,
    
    -- Prevent duplicate citations
    CONSTRAINT uk_note_citation UNIQUE (note_id, referenced_note_id),
    
    -- Prevent self-citation
    CONSTRAINT chk_no_self_citation CHECK (note_id != referenced_note_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_note_citation_note ON note_citations(note_id);
CREATE INDEX IF NOT EXISTS idx_note_citation_referenced ON note_citations(referenced_note_id);
CREATE INDEX IF NOT EXISTS idx_note_citation_order ON note_citations(note_id, citation_order);

-- ============================================================
-- Step 3: Migrate data from old tables (if they exist)
-- ============================================================

-- This is a placeholder for data migration logic
-- If you have existing bibliography_source data, you would:
-- 1. Create a StudyNote for each BibliographySource
-- 2. Update note_bibliography to reference the new note IDs
-- 3. Copy to note_citations

-- Example migration (uncomment and modify as needed):
/*
-- Create notes from bibliography sources
INSERT INTO study_notes (
    id, title, subtitle, content, abstract_text, keywords,
    note_type, citation_style, authors, publication_year,
    journal_name, publisher, pages, doi, url, isbn, issn, edition,
    volume, issue, accessed_date, citation_key, favorite,
    is_public, visibility, user_id, created_at, updated_at
)
SELECT 
    id, title, NULL, abstract_text, abstract_text, keywords,
    'RESEARCH', 'APA', authors, publication_year,
    journal_name, publisher, pages, doi, url, isbn, issn, edition,
    volume, issue, accessed_date, citation_key, favorite,
    FALSE, 'PRIVATE', user_id, created_at, updated_at
FROM bibliography_source;

-- Migrate citations
INSERT INTO note_citations (
    note_id, referenced_note_id, citation_order, page_reference,
    inline_marker, context, first_position, citation_count,
    created_at, updated_at
)
SELECT 
    nb.note_id, nb.source_id, nb.citation_order, nb.page_reference,
    nb.inline_marker, nb.context, nb.first_position, nb.citation_count,
    nb.created_at, nb.updated_at
FROM note_bibliography nb;
*/

-- ============================================================
-- Step 4: Drop old tables (AFTER successful migration)
-- ============================================================

-- WARNING: Only run these after verifying data migration!
-- DROP TABLE IF EXISTS note_bibliography CASCADE;
-- DROP TABLE IF EXISTS bibliography_source CASCADE;
-- DROP TABLE IF EXISTS bibliography_collection CASCADE;

-- ============================================================
-- Step 5: Add trigger for updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_note_citations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_note_citations_updated_at ON note_citations;
CREATE TRIGGER trigger_note_citations_updated_at
    BEFORE UPDATE ON note_citations
    FOR EACH ROW
    EXECUTE FUNCTION update_note_citations_updated_at();

-- ============================================================
-- Migration Complete
-- ============================================================
-- The system now uses a Note-to-Note citation model where:
-- - Every reference is a StudyNote
-- - Citations link notes to other notes
-- - Rich citation metadata is preserved on the relationship
-- - Notes can have 0 to many incoming/outgoing citations
