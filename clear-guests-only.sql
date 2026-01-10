-- ===========================================
-- QUICK FIX: Clear guests table only
-- This will clear what /admin/tables displays
-- ===========================================

DELETE FROM "guests";

-- Verify it's empty
SELECT COUNT(*) as guests_remaining FROM "guests";