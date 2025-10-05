-- Add CreatedAt and UpdatedAt columns to SocialLinks table
-- This script is idempotent - it won't fail if columns already exist

DO $$ 
BEGIN
    -- Add CreatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'SocialLinks' 
        AND column_name = 'CreatedAt'
    ) THEN
        ALTER TABLE "SocialLinks" 
        ADD COLUMN "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        
        RAISE NOTICE 'CreatedAt column added to SocialLinks table';
    ELSE
        RAISE NOTICE 'CreatedAt column already exists in SocialLinks table';
    END IF;

    -- Add UpdatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'SocialLinks' 
        AND column_name = 'UpdatedAt'
    ) THEN
        ALTER TABLE "SocialLinks" 
        ADD COLUMN "UpdatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        
        RAISE NOTICE 'UpdatedAt column added to SocialLinks table';
    ELSE
        RAISE NOTICE 'UpdatedAt column already exists in SocialLinks table';
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'SocialLinks'
ORDER BY 
    ordinal_position;
