-- Migration: Add PreferredLanguage column to AspNetUsers table
-- This adds support for user language preferences

-- First, let's check what tables exist in the current database
SELECT TABLE_NAME, TABLE_SCHEMA
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'AspNet%';

-- Alternative: Check if the AspNetUsers table exists (uncomment the appropriate one)
-- For PostgreSQL:
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AspNetUsers') AS table_exists;

-- Add PreferredLanguage column to existing AspNetUsers table
DO $$
BEGIN
    -- Check if AspNetUsers table exists (case-sensitive)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'AspNetUsers') THEN
        RAISE NOTICE 'AspNetUsers table exists, adding PreferredLanguage column...';

        -- Add PreferredLanguage column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'AspNetUsers' AND column_name = 'PreferredLanguage') THEN
            ALTER TABLE "AspNetUsers" ADD COLUMN "PreferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'en';

            -- Add check constraint to ensure only valid languages
            ALTER TABLE "AspNetUsers"
            ADD CONSTRAINT "CK_AspNetUsers_PreferredLanguage"
            CHECK ("PreferredLanguage" IN ('en', 'nl', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'fa'));

            -- Create index for faster queries (optional but recommended)
            CREATE INDEX "IX_AspNetUsers_PreferredLanguage" ON "AspNetUsers"("PreferredLanguage");

            -- Update existing users to have default language
            UPDATE "AspNetUsers" SET "PreferredLanguage" = 'en' WHERE "PreferredLanguage" IS NULL OR "PreferredLanguage" = '';

            RAISE NOTICE 'PreferredLanguage column added successfully';
        ELSE
            RAISE NOTICE 'PreferredLanguage column already exists';
        END IF;
    ELSE
        RAISE NOTICE 'AspNetUsers table does not exist. Please run Entity Framework migrations first or create the table manually.';
    END IF;
END $$;
