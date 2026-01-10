-- ===========================================
-- CLEAR ALL BOOKINGS - Reset Database to Zero Bookings
-- Run this in Google Cloud SQL Studio to clear all booking data
-- ===========================================

-- ===========================================
-- DELETE ALL BOOKING-RELATED DATA
-- ===========================================

-- Delete in correct order to avoid foreign key constraint violations

-- 1. Delete junction table entries first
DELETE FROM "_BookingGuests";

-- 2. Delete invite codes
DELETE FROM "invite_codes";

-- 3. Delete email logs
DELETE FROM "email_logs";

-- 4. Delete guests (this is what /admin/tables displays!)
DELETE FROM "guests";

-- 5. Delete main bookings table
DELETE FROM "bookings";

-- ===========================================
-- RESET INVENTORY SETTINGS (Optional - uncomment if needed)
-- ===========================================

-- Reset inventory to default values
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
-- VERIFY THE CLEANUP
-- ===========================================

-- Check that all bookings are gone
SELECT
    'Bookings deleted:' as status,
    COUNT(*) as count
FROM "bookings"

UNION ALL

SELECT
    'Invite codes deleted:',
    COUNT(*)
FROM "invite_codes"

UNION ALL

SELECT
    'Email logs deleted:',
    COUNT(*)
FROM "email_logs"

UNION ALL

SELECT
    'Guests deleted (what admin/tables shows):',
    COUNT(*)
FROM "guests"

UNION ALL

SELECT
    'Booking guests deleted:',
    COUNT(*)
FROM "_BookingGuests"

UNION ALL

SELECT
    'Tables still available:',
    COUNT(*)
FROM "tables"

UNION ALL

SELECT
    'Admin users preserved:',
    COUNT(*)
FROM "admins";