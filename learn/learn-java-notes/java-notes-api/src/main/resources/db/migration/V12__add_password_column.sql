-- V12: Add password column to users table
-- This column was missing from the original schema and is required for authentication

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT '';

-- Update the default constraint after adding the column
ALTER TABLE users 
ALTER COLUMN password DROP DEFAULT;
