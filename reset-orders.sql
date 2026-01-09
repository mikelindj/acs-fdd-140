-- ===========================================
-- RESET ALL ORDERS - Safe Database Cleanup
-- Run this in Google Cloud SQL Studio to reset the site
-- ===========================================

-- ===========================================
-- DELETE ALL BOOKING-RELATED DATA
-- ===========================================

-- Delete in correct order to avoid foreign key constraint violations
DELETE FROM "_BookingGuests";
DELETE FROM "invite_codes";
DELETE FROM "email_logs";
DELETE FROM "bookings";

-- ===========================================
-- RESET INVENTORY TO DEFAULTS
-- ===========================================

UPDATE "inventory_settings"
SET
    "totalTables" = 92,
    "maxElevenSeaterTables" = 0,
    "tablePrice" = 2800.00,
    "seatPrice" = 280.00,
    "tablePromoPrice" = NULL,
    "seatPromoPrice" = NULL,
    "tableMembersPrice" = 2300.00,
    "seatMembersPrice" = 230.00,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'inventory';

-- ===========================================
-- RESET EVENT SETTINGS (Optional)
-- ===========================================

-- Uncomment if you want to reset event settings too:
-- UPDATE "event_settings"
-- SET
--     "eventName" = 'ACS Founders'' Day Dinner 140 Years',
--     "eventDate" = '2025-02-28 19:00:00+08',
--     "eventVenue" = 'Anglo-Chinese School (Independent), Singapore',
--     "logoImageUrl" = '/images/acs-140-logo.jpg',
--     "footerLogoImageUrl" = '/images/acs-logo.png',
--     "siteIconUrl" = '/images/acs-140-siteicon.png',
--     "updatedAt" = CURRENT_TIMESTAMP
-- WHERE "id" = 'event';

-- ===========================================
-- VERIFY THE RESET
-- ===========================================

-- Check that bookings are gone
SELECT 'Bookings deleted:' as status, COUNT(*) as count FROM "bookings"
UNION ALL
SELECT 'Invite codes deleted:', COUNT(*) FROM "invite_codes"
UNION ALL
SELECT 'Email logs deleted:', COUNT(*) FROM "email_logs"
UNION ALL
SELECT 'Tables still available:', COUNT(*) FROM "tables"
UNION ALL
SELECT 'Admin users preserved:', COUNT(*) FROM "admins";

-- Check inventory settings
SELECT * FROM "inventory_settings" WHERE "id" = 'inventory';

-- ===========================================
-- OPTIONAL: RECREATE ADMIN USER (if needed)
-- ===========================================

-- Uncomment and modify if you need to recreate the admin user:
-- DELETE FROM "admins";
-- INSERT INTO "admins" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
-- VALUES (
--     'admin-acsoba-user',
--     'admin@acsoba.org',
--     'ACS OBA Administrator',
--     '$2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC',
--     CURRENT_TIMESTAMP,
--     CURRENT_TIMESTAMP
-- );