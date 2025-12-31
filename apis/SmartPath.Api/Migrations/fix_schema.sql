-- Check actual column names in PracticeAttempts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'PracticeAttempts'
ORDER BY ordinal_position;

-- If PracticeSessionId exists but foreign key is missing, add it:
-- ALTER TABLE "PracticeAttempts" 
-- ADD CONSTRAINT "FK_PracticeAttempts_PracticeSessions_PracticeSessionId" 
-- FOREIGN KEY ("PracticeSessionId") 
-- REFERENCES "PracticeSessions" ("Id") 
-- ON DELETE CASCADE;
