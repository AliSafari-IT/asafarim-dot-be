# Database Migration for Authentication System

This document outlines the database changes required to implement user authentication in the learn-java-notes project.

## Overview

The migration adds user management with roles and associates study notes with specific users.

## New Tables

### 1. users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. roles Table

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);
```

### 3. user_roles Table (Many-to-Many Relationship)

```sql
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

## Existing Table Changes

### 4. study_notes Table - Add User Association

```sql
-- Add user_id foreign key column
ALTER TABLE study_notes 
ADD COLUMN user_id INTEGER NOT NULL;

-- Add foreign key constraint
ALTER TABLE study_notes 
ADD CONSTRAINT fk_study_notes_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_study_notes_user_id ON study_notes(user_id);
```

## Initial Data

### Insert Default Roles

```sql
INSERT INTO roles (name) VALUES ('USER');
INSERT INTO roles (name) VALUES ('ADMIN');
```

## Migration Steps

### Step 1: Backup Existing Data

```sql
-- Backup existing study notes
CREATE TABLE study_notes_backup AS SELECT * FROM study_notes;
```

### Step 2: Create New Tables

```sql
-- Execute the CREATE TABLE statements above in order:
-- 1. users table
-- 2. roles table  
-- 3. user_roles table
```

### Step 3: Modify study_notes Table

```sql
-- Add user_id column (will be NULL initially)
ALTER TABLE study_notes ADD COLUMN user_id INTEGER;

-- Create a default user for existing notes
INSERT INTO users (username, email, password) 
VALUES ('migrated_user', 'migrated@example.com', '$2a$10$placeholder.hash.here');

-- Update existing notes to belong to the default user
UPDATE study_notes SET user_id = (SELECT id FROM users WHERE username = 'migrated_user') WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating all records
ALTER TABLE study_notes ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE study_notes 
ADD CONSTRAINT fk_study_notes_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Add index
CREATE INDEX idx_study_notes_user_id ON study_notes(user_id);
```

### Step 4: Insert Default Roles

```sql
INSERT INTO roles (name) VALUES ('USER'), ('ADMIN');
```

### Step 5: Assign Default Role to Migrated User

```sql
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'migrated_user' AND r.name = 'USER';
```

### Step 6: Update Timestamps

```sql
-- Add created_at and updated_at columns to users table if not present
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Verification

### Check Tables Exist

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'roles', 'user_roles');
```

### Check Foreign Keys

```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Check Data Integrity

```sql
-- Verify all study notes have a user
SELECT COUNT(*) FROM study_notes WHERE user_id IS NULL;

-- Verify all users have at least one role
SELECT u.id, u.username 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.user_id IS NULL;
```

## Rollback Plan

If needed, rollback steps:

```sql
-- Drop foreign key constraints
ALTER TABLE study_notes DROP CONSTRAINT IF EXISTS fk_study_notes_user;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Drop new tables
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- Remove user_id column from study_notes
ALTER TABLE study_notes DROP COLUMN IF EXISTS user_id;

-- Restore from backup if needed
-- TRUNCATE TABLE study_notes;
-- INSERT INTO study_notes SELECT * FROM study_notes_backup;
```

## Notes

1. The application uses JPA/Hibernate with `ddl-auto=update`, so most of these changes will be applied automatically when the application starts.
2. The DataInitializer component will automatically create default roles.
3. Passwords are hashed using BCrypt, never store plain text passwords.
4. The migration assumes PostgreSQL. Adjust syntax for other databases if needed.
5. Consider creating a separate migration script for production environments using tools like Flyway or Liquibase.
