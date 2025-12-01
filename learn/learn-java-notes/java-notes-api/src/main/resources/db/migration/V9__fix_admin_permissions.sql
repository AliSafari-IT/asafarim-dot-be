-- V9: Fix Admin Permissions
-- Ensure ADMIN role has all permissions assigned

-- First, ensure all permissions exist
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

-- Ensure system settings exist
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

-- Clear existing role_permissions for ADMIN to avoid duplicates
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'ADMIN');

-- Assign ALL permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r
CROSS JOIN permissions p 
WHERE r.name = 'ADMIN';
