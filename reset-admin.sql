-- Reset Admin Users
-- Delete all existing admin users and create new one
-- Email: admin@acsoba.org
-- Password: TGBTG-TBIYTB (no leading space)
-- Bcrypt Hash: $2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC

-- Delete all existing admin users
DELETE FROM "admins";

-- Create new admin user
INSERT INTO "admins" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
VALUES (
    'admin-acsoba-user',
    'admin@acsoba.org',
    'ACS OBA Administrator',
    '$2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify the admin user was created
SELECT id, email, name FROM "admins" WHERE email = 'admin@acsoba.org';