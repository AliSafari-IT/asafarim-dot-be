-- Check if SocialLinks table exists and its structure
SELECT 
    table_schema,
    table_name,
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

-- If the columns don't exist, add them manually:
-- ALTER TABLE "SocialLinks" ADD COLUMN IF NOT EXISTS "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
-- ALTER TABLE "SocialLinks" ADD COLUMN IF NOT EXISTS "UpdatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
