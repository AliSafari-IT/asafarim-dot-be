SELECT * FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251105152751_AddTestCafeFileToTestSuite';

ALTER TABLE "TestSuites" 
ADD COLUMN "GeneratedAt" timestamp with time zone NULL,
ADD COLUMN "GeneratedTestCafeFile" text NULL;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'TestSuites' 
AND column_name IN ('GeneratedAt', 'GeneratedTestCafeFile');

SELECT * FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20251105152751_AddTestCafeFileToTestSuite';
