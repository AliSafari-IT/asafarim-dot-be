-- Create tables for ChatSession and ChatMessage
CREATE TABLE IF NOT EXISTS "ChatSessions" (
    "Id" uuid NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Description" character varying(1000) NULL,
    "UserId" character varying(255) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "LastMessageAt" timestamp with time zone NULL,
    "IsArchived" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "MessageCount" integer NOT NULL,
    CONSTRAINT "PK_ChatSessions" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "ChatMessages" (
    "Id" uuid NOT NULL,
    "SessionId" uuid NOT NULL,
    "UserId" character varying(255) NOT NULL,
    "Role" character varying(20) NOT NULL,
    "Content" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "ModelUsed" character varying(100) NULL,
    CONSTRAINT "PK_ChatMessages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ChatMessages_ChatSessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES "ChatSessions" ("Id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_ChatSessions_UserId" ON "ChatSessions" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_ChatSessions_CreatedAt" ON "ChatSessions" ("CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_ChatSessions_LastMessageAt" ON "ChatSessions" ("LastMessageAt");
CREATE INDEX IF NOT EXISTS "IX_ChatSessions_UserId_IsDeleted" ON "ChatSessions" ("UserId", "IsDeleted");

CREATE INDEX IF NOT EXISTS "IX_ChatMessages_SessionId" ON "ChatMessages" ("SessionId");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_UserId" ON "ChatMessages" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_CreatedAt" ON "ChatMessages" ("CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_ChatMessages_Role" ON "ChatMessages" ("Role");
