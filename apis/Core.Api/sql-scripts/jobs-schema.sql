-- SQL Script to create Jobs database schema
-- This script creates the JobApplications table in the Jobs database

-- Create JobApplications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."JobApplications" (
    "Id" UUID PRIMARY KEY,
    "Company" VARCHAR(100) NOT NULL,
    "Role" VARCHAR(100) NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "AppliedDate" TIMESTAMP NOT NULL,
    "Notes" TEXT NULL,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_JobApplications_Company" ON public."JobApplications" ("Company");
CREATE INDEX IF NOT EXISTS "IX_JobApplications_Status" ON public."JobApplications" ("Status");
CREATE INDEX IF NOT EXISTS "IX_JobApplications_AppliedDate" ON public."JobApplications" ("AppliedDate");

-- Sample data (uncomment to insert)
/*
INSERT INTO public."JobApplications" ("Id", "Company", "Role", "Status", "AppliedDate", "Notes", "CreatedAt")
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Example Corp', 'Software Engineer', 'Applied', '2025-08-15', 'Applied through company website', CURRENT_TIMESTAMP),
    ('22222222-2222-2222-2222-222222222222', 'Tech Solutions', 'Full Stack Developer', 'Interview', '2025-08-10', 'First interview scheduled for next week', CURRENT_TIMESTAMP),
    ('33333333-3333-3333-3333-333333333333', 'Digital Innovations', 'Frontend Developer', 'Rejected', '2025-08-05', 'Position was filled internally', CURRENT_TIMESTAMP);
*/
