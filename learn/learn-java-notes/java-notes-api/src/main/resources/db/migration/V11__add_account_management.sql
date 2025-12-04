-- V11: Add account management tables (sessions, activity)

-- User Sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    token_hash VARCHAR(64),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_current BOOLEAN DEFAULT FALSE
);

-- Index for faster lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Account Activities table for tracking user actions
CREATE TABLE IF NOT EXISTS account_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    ip_address VARCHAR(45),
    device_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_account_activities_user_id ON account_activities(user_id);
CREATE INDEX idx_account_activities_created_at ON account_activities(created_at);
CREATE INDEX idx_account_activities_type ON account_activities(type);

-- Add new columns to user_preferences if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'email_notifications') THEN
        ALTER TABLE user_preferences ADD COLUMN email_notifications BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' AND column_name = 'default_editor') THEN
        ALTER TABLE user_preferences ADD COLUMN default_editor VARCHAR(20) DEFAULT 'markdown';
    END IF;
END $$;
