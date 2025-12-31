-- Add SessionId column to PracticeAttempts table
ALTER TABLE "PracticeAttempts" 
ADD COLUMN "SessionId" integer NOT NULL DEFAULT 0;

-- Create index on SessionId
CREATE INDEX "IX_PracticeAttempts_SessionId" 
ON "PracticeAttempts" ("SessionId");

-- Add foreign key constraint
ALTER TABLE "PracticeAttempts" 
ADD CONSTRAINT "FK_PracticeAttempts_PracticeSessions_SessionId" 
FOREIGN KEY ("SessionId") 
REFERENCES "PracticeSessions" ("Id") 
ON DELETE CASCADE;

-- Insert migration history record
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251231220000_AddSessionIdToPracticeAttempt', '8.0.0');
