-- Check the actual PracticeAttempts table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'PracticeAttempts'
ORDER BY ordinal_position;
