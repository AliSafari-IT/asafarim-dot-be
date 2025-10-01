-- Fix migration history by removing the old WorkExperience migration
-- Run this SQL script to clean up the migration history

-- Remove the old AddWorkExperience migration from history
DELETE FROM public."__EFMigrationsHistory" 
WHERE "MigrationId" = '20250930195341_AddWorkExperience';

-- Verify it's removed
SELECT * FROM public."__EFMigrationsHistory" ORDER BY "MigrationId";

-- Update the migration history to the latest migration
DELETE FROM public."__EFMigrationsHistory" 
WHERE "MigrationId" = '20250930195341_AddWorkExperience';

-- update the database


