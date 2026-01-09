-- Quick Fix: Create Admin User and Grant Permissions
-- Run this if the tables already exist but you need admin user and permissions

-- Create admin user (only if admins table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
        INSERT INTO "admins" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
        VALUES (
            'admin-acsoba-user',
            'admin@acsoba.org',
            'ACS OBA Administrator',
            '$2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) ON CONFLICT ("email") DO UPDATE SET
            "name" = EXCLUDED."name",
            "passwordHash" = EXCLUDED."passwordHash",
            "updatedAt" = CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Grant permissions to postgres user (if you have admin access)
-- Note: You may need to run these as a database admin/superuser

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO postgres;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- Check what we have
SELECT 'Admin users:' as info, COUNT(*) as count FROM "admins"
UNION ALL
SELECT 'Tables:', COUNT(*) FROM "tables"
UNION ALL
SELECT 'Bookings:', COUNT(*) FROM "bookings";