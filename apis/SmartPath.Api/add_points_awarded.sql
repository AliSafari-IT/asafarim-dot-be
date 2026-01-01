-- Add PointsAwarded column to PracticeAttempts table
ALTER TABLE "PracticeAttempts" 
ADD COLUMN IF NOT EXISTS "PointsAwarded" integer NOT NULL DEFAULT 0;
