-- AspNetRoles
-- Insert 5 roles into ASP.NET Identity roles table (Guid PK)
BEGIN;

-- INSERT INTO "AspNetRoles" ("Id","Name","NormalizedName","ConcurrencyStamp") VALUES
-- ('7a3a2b2e-8b46-43d0-9d7d-2c3c2d6f4a11','Admin','ADMIN','c7b5d8b0-8f6b-47d5-a2c6-6e2b1d4a9f01'),
-- ('f9b1d6d4-3e2a-4a1f-88c6-5c3f0a2b6c22','User','USER','b2a7f3c6-7d1e-4e2a-9f1c-0e3b2a6c5d12'),
-- ('2c6f3a1e-5d4b-4c2a-8f0e-1a2b3c4d5e33','Manager','MANAGER','d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f23'),
-- ('9e8d7c6b-5a4f-4321-9abc-0def12345644','Editor','EDITOR','e3f2a1b0-c9d8-4e7f-8a6b-5c4d3e2f1a34'),
-- ('1b2c3d4e-5f6a-4789-8abc-def012345655','Viewer','VIEWER','a0b1c2d3-e4f5-4061-9a8b-7c6d5e4f3a45')
-- ON CONFLICT ("NormalizedName") DO NOTHING;

-- COMMIT;

-- Verify
-- SELECT * FROM "AspNetRoles" LIMIT 100;

 INSERT INTO "AspNetUserRoles" ("UserId","RoleId") VALUES
 ('a2f7eb4c-c5a8-402d-8d25-293f8c19796f','7a3a2b2e-8b46-43d0-9d7d-2c3c2d6f4a11'),
 ('a2f7eb4c-c5a8-402d-8d25-293f8c19796f','2c6f3a1e-5d4b-4c2a-8f0e-1a2b3c4d5e33')
 ON CONFLICT ("UserId","RoleId") DO NOTHING;

 COMMIT;