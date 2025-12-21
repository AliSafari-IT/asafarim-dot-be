-- V13: Add missing columns to study_notes table
-- These columns were defined in the entity but missing from the schema

ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS abstract_text TEXT;
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS keywords TEXT;
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS note_type VARCHAR(20) DEFAULT 'SIMPLE';
ALTER TABLE study_notes ADD COLUMN IF NOT EXISTS citation_style VARCHAR(20) DEFAULT 'APA';
