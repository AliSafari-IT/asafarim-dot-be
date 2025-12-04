-- V10: Add User Preferences Table
-- Stores per-user settings like theme, language, notes per page

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notes_per_page INTEGER DEFAULT 10,
    theme VARCHAR(20) DEFAULT 'SYSTEM',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Initialize preferences for existing users (optional)
INSERT INTO user_preferences (user_id, notes_per_page, theme, language)
SELECT id, 10, 'SYSTEM', 'en' FROM users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO NOTHING;
