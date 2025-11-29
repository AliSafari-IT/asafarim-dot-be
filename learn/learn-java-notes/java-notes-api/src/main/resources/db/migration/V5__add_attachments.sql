-- Migration V5: Add attachments table for file uploads
-- Supports both database storage (BYTEA) and filesystem storage

-- Create attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES study_notes (id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data BYTEA,
    storage_path TEXT,
    CONSTRAINT chk_storage CHECK (
        (
            data IS NOT NULL
            AND storage_path IS NULL
        )
        OR (
            data IS NULL
            AND storage_path IS NOT NULL
        )
    )
);

-- Create indexes for performance
CREATE INDEX idx_attachments_note_id ON attachments (note_id);

CREATE INDEX idx_attachments_note_id_public ON attachments (note_id, is_public);

CREATE INDEX idx_attachments_uploaded_at ON attachments (uploaded_at DESC);

-- Comments
COMMENT ON TABLE attachments IS 'File attachments for study notes (PDFs, images, documents, etc.)';

COMMENT ON COLUMN attachments.data IS 'Binary data for small files (≤1MB) stored in database';

COMMENT ON COLUMN attachments.storage_path IS 'Relative path for large files (>1MB) stored on filesystem';

COMMENT ON COLUMN attachments.is_public IS 'Whether attachment is publicly accessible (must match note visibility rules)';

COMMENT ON CONSTRAINT chk_storage ON attachments IS 'Ensure exactly one storage method is used (either data or storage_path)';