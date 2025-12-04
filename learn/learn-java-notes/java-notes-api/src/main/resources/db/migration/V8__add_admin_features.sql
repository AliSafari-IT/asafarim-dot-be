-- V8: Add Admin Panel Features
-- Permissions, Audit Logs, System Settings, User enhancements, Role enhancements

-- ============================================================
-- 1. Add new columns to users table
-- ============================================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS lock_reason VARCHAR(500),
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS locked_by UUID,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Set display_name to username for existing users
UPDATE users SET display_name = username WHERE display_name IS NULL;

-- ============================================================
-- 2. Add new columns to roles table
-- ============================================================
ALTER TABLE roles
ADD COLUMN IF NOT EXISTS description VARCHAR(255),
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Mark existing roles as system roles
UPDATE roles SET is_system = TRUE WHERE name IN ('USER', 'ADMIN', 'MODERATOR');

-- ============================================================
-- 3. Create permissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- ============================================================
-- 4. Create role_permissions junction table
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- 5. Create audit_logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    user_id UUID,
    user_name VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details TEXT,
    old_value TEXT,
    new_value TEXT,
    severity VARCHAR(20) DEFAULT 'INFO',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity);

-- ============================================================
-- 6. Create system_settings table
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    category VARCHAR(50),
    value_type VARCHAR(20) DEFAULT 'STRING',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- ============================================================
-- 7. Seed default permissions
-- ============================================================
INSERT INTO permissions (name, description, category) VALUES
    -- User permissions
    ('USERS_VIEW', 'View user list and details', 'USERS'),
    ('USERS_CREATE', 'Create new users', 'USERS'),
    ('USERS_EDIT', 'Edit user details', 'USERS'),
    ('USERS_DELETE', 'Delete users', 'USERS'),
    ('USERS_LOCK', 'Lock and unlock users', 'USERS'),
    ('USERS_ROLES', 'Assign roles to users', 'USERS'),
    ('USERS_IMPERSONATE', 'Impersonate other users', 'USERS'),
    
    -- Role permissions
    ('ROLES_VIEW', 'View role list and details', 'ROLES'),
    ('ROLES_CREATE', 'Create new roles', 'ROLES'),
    ('ROLES_EDIT', 'Edit role details', 'ROLES'),
    ('ROLES_DELETE', 'Delete roles', 'ROLES'),
    ('ROLES_PERMISSIONS', 'Manage role permissions', 'ROLES'),
    
    -- Permission management
    ('PERMISSIONS_VIEW', 'View permissions list', 'PERMISSIONS'),
    ('PERMISSIONS_CREATE', 'Create new permissions', 'PERMISSIONS'),
    ('PERMISSIONS_DELETE', 'Delete permissions', 'PERMISSIONS'),
    
    -- Notes management
    ('NOTES_VIEW_ALL', 'View all notes including private', 'NOTES'),
    ('NOTES_EDIT_ALL', 'Edit any note', 'NOTES'),
    ('NOTES_DELETE_ALL', 'Delete any note', 'NOTES'),
    ('NOTES_VISIBILITY', 'Override note visibility', 'NOTES'),
    ('NOTES_FEATURE', 'Feature notes', 'NOTES'),
    
    -- Tags management
    ('TAGS_MANAGE', 'Manage all tags', 'TAGS'),
    ('TAGS_MERGE', 'Merge tags', 'TAGS'),
    ('TAGS_LOCK', 'Lock/unlock tags', 'TAGS'),
    
    -- Attachments management
    ('ATTACHMENTS_VIEW_ALL', 'View all attachments', 'ATTACHMENTS'),
    ('ATTACHMENTS_DELETE_ALL', 'Delete any attachment', 'ATTACHMENTS'),
    ('ATTACHMENTS_STORAGE', 'View storage usage', 'ATTACHMENTS'),
    
    -- System permissions
    ('SYSTEM_SETTINGS', 'Manage system settings', 'SYSTEM'),
    ('SYSTEM_LOGS', 'View system logs', 'SYSTEM'),
    ('SYSTEM_ANALYTICS', 'View analytics', 'SYSTEM'),
    ('SYSTEM_MAINTENANCE', 'Enable maintenance mode', 'SYSTEM'),
    ('SYSTEM_ANNOUNCEMENTS', 'Manage announcements', 'SYSTEM')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 8. Assign all permissions to ADMIN role
-- ============================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. Seed default system settings
-- ============================================================
INSERT INTO system_settings (setting_key, setting_value, description, category, value_type) VALUES
    ('MAINTENANCE_MODE', 'false', 'Enable read-only maintenance mode', 'SYSTEM', 'BOOLEAN'),
    ('REGISTRATION_ENABLED', 'true', 'Allow new user registrations', 'AUTH', 'BOOLEAN'),
    ('SYSTEM_ANNOUNCEMENT', '', 'System-wide announcement message', 'SYSTEM', 'STRING'),
    ('MAX_FAILED_LOGINS', '5', 'Maximum failed login attempts before lockout', 'AUTH', 'INTEGER'),
    ('LOCKOUT_DURATION_MINUTES', '30', 'Account lockout duration in minutes', 'AUTH', 'INTEGER'),
    ('SESSION_TIMEOUT_MINUTES', '60', 'Session timeout in minutes', 'AUTH', 'INTEGER'),
    ('MAX_ATTACHMENT_SIZE_MB', '10', 'Maximum attachment size in MB', 'STORAGE', 'INTEGER'),
    ('TOTAL_STORAGE_LIMIT_GB', '100', 'Total storage limit in GB', 'STORAGE', 'INTEGER')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================
-- 10. Update ADMIN role with description
-- ============================================================
UPDATE roles SET 
    description = 'Full system administrator with all permissions',
    color = '#dc2626'
WHERE name = 'ADMIN';

UPDATE roles SET 
    description = 'Standard user with basic permissions',
    color = '#3b82f6'
WHERE name = 'USER';

-- Add MODERATOR role if it doesn't exist
INSERT INTO roles (name, description, color, is_system, created_at)
VALUES ('MODERATOR', 'Content moderator with limited admin access', '#f59e0b', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description,
    color = EXCLUDED.color;

-- Assign some permissions to MODERATOR role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'MODERATOR' 
AND p.name IN ('USERS_VIEW', 'NOTES_VIEW_ALL', 'NOTES_VISIBILITY', 'NOTES_FEATURE', 'TAGS_MANAGE', 'SYSTEM_ANALYTICS')
ON CONFLICT DO NOTHING;
