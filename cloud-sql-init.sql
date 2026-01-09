-- ===========================================
-- ACS Founders' Day Dinner - Complete Cloud SQL Initialization
-- Run this script in Google Cloud SQL Studio (Query tab)
-- ===========================================

-- ===========================================
-- CLEANUP: Drop existing objects (safe to run multiple times)
-- ===========================================

-- Drop Prisma migration table (if it exists)
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Drop application tables
DROP TABLE IF EXISTS "_BookingGuests" CASCADE;
DROP TABLE IF EXISTS "invite_codes" CASCADE;
DROP TABLE IF EXISTS "email_logs" CASCADE;
DROP TABLE IF EXISTS "bookings" CASCADE;
DROP TABLE IF EXISTS "tables" CASCADE;
DROP TABLE IF EXISTS "guests" CASCADE;
DROP TABLE IF EXISTS "vouchers" CASCADE;
DROP TABLE IF EXISTS "inventory_settings" CASCADE;
DROP TABLE IF EXISTS "event_settings" CASCADE;
DROP TABLE IF EXISTS "admins" CASCADE;

DROP TYPE IF EXISTS "BookingType" CASCADE;
DROP TYPE IF EXISTS "BookingCategory" CASCADE;
DROP TYPE IF EXISTS "TableStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "VoucherType" CASCADE;

-- ===========================================
-- CREATE ENUM TYPES
-- ===========================================

CREATE TYPE "BookingType" AS ENUM ('TABLE', 'SEAT');
CREATE TYPE "BookingCategory" AS ENUM ('VIP', 'SCHOOL', 'OBA', 'GUEST');
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'FULL');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "VoucherType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE');

-- ===========================================
-- CREATE TABLES
-- ===========================================

-- Admins table
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- Guests table
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "birthYear" INTEGER,
    "school" TEXT,
    "gradYear" INTEGER,
    "dietary" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "membershipNo" TEXT,
    "tableId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- Tables table
CREATE TABLE "tables" (
    "id" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "tableHash" TEXT NOT NULL,
    "x" DOUBLE PRECISION,
    "y" DOUBLE PRECISION,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- Bookings table
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "type" "BookingType" NOT NULL,
    "category" "BookingCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "transactionFee" DECIMAL(10,2),
    "balanceDue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hitpayPaymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "buyerId" TEXT NOT NULL,
    "voucherId" TEXT,
    "wantsBatchSeating" BOOLEAN DEFAULT false,
    "school" TEXT,
    "gradYear" INTEGER,
    "cuisine" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- Invite codes table
CREATE TABLE "invite_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "guestId" TEXT,
    "email" TEXT,
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- Email logs table
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- Inventory settings table
CREATE TABLE "inventory_settings" (
    "id" TEXT NOT NULL DEFAULT 'inventory',
    "totalTables" INTEGER NOT NULL DEFAULT 0,
    "maxElevenSeaterTables" INTEGER NOT NULL DEFAULT 0,
    "tablePrice" DECIMAL(10,2) NOT NULL DEFAULT 1000,
    "seatPrice" DECIMAL(10,2) NOT NULL DEFAULT 100,
    "tablePromoPrice" DECIMAL(10,2),
    "seatPromoPrice" DECIMAL(10,2),
    "tableMembersPrice" DECIMAL(10,2),
    "seatMembersPrice" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inventory_settings_pkey" PRIMARY KEY ("id")
);

-- Vouchers table
CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "type" "VoucherType" NOT NULL,
    "discountPercent" DECIMAL(5,2),
    "discountAmount" DECIMAL(10,2),
    "fixedPrice" DECIMAL(10,2),
    "maxRedemptions" INTEGER NOT NULL,
    "currentRedemptions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- Event settings table
CREATE TABLE "event_settings" (
    "id" TEXT NOT NULL,
    "eventName" TEXT,
    "eventDate" TIMESTAMP(3),
    "eventVenue" TEXT,
    "logoImageUrl" TEXT,
    "footerLogoImageUrl" TEXT,
    "siteIconUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "event_settings_pkey" PRIMARY KEY ("id")
);

-- Junction table for many-to-many relationship
CREATE TABLE "_BookingGuests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- ===========================================
-- CREATE INDEXES
-- ===========================================

CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
CREATE UNIQUE INDEX "guests_email_key" ON "guests"("email");
CREATE INDEX "guests_email_idx" ON "guests"("email");
CREATE INDEX "guests_tableId_idx" ON "guests"("tableId");
CREATE UNIQUE INDEX "tables_tableNumber_key" ON "tables"("tableNumber");
CREATE UNIQUE INDEX "tables_tableHash_key" ON "tables"("tableHash");
CREATE UNIQUE INDEX "tables_bookingId_key" ON "tables"("bookingId");
CREATE INDEX "tables_tableHash_idx" ON "tables"("tableHash");
CREATE INDEX "tables_status_idx" ON "tables"("status");
CREATE UNIQUE INDEX "bookings_hitpayPaymentId_key" ON "bookings"("hitpayPaymentId");
CREATE INDEX "bookings_buyerId_idx" ON "bookings"("buyerId");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_hitpayPaymentId_idx" ON "bookings"("hitpayPaymentId");
CREATE INDEX "bookings_voucherId_idx" ON "bookings"("voucherId");
CREATE UNIQUE INDEX "invite_codes_code_key" ON "invite_codes"("code");
CREATE INDEX "invite_codes_code_idx" ON "invite_codes"("code");
CREATE INDEX "invite_codes_bookingId_idx" ON "invite_codes"("bookingId");
CREATE INDEX "email_logs_to_idx" ON "email_logs"("to");
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");
CREATE INDEX "vouchers_code_idx" ON "vouchers"("code");
CREATE INDEX "vouchers_isActive_idx" ON "vouchers"("isActive");
CREATE UNIQUE INDEX "_BookingGuests_AB_unique" ON "_BookingGuests"("A", "B");
CREATE INDEX "_BookingGuests_B_index" ON "_BookingGuests"("B");

-- ===========================================
-- CREATE FOREIGN KEY CONSTRAINTS
-- ===========================================

ALTER TABLE "guests" ADD CONSTRAINT "guests_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tables" ADD CONSTRAINT "tables_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invite_codes" ADD CONSTRAINT "invite_codes_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_BookingGuests" ADD CONSTRAINT "_BookingGuests_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_BookingGuests" ADD CONSTRAINT "_BookingGuests_B_fkey" FOREIGN KEY ("B") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ===========================================
-- INSERT INITIAL DATA
-- ===========================================

-- Create admin user (password: TGBTG-TBIYTB)
INSERT INTO "admins" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
VALUES (
    'admin-acsoba-user',
    'admin@acsoba.org',
    'ACS OBA Administrator',
    '$2a$10$7afBvaq/2he20HmLUJCU0uns7r0c03xmbPxgX4CqVjMLYUyLDSgJC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert inventory settings
INSERT INTO "inventory_settings" (
    "id",
    "totalTables",
    "maxElevenSeaterTables",
    "tablePrice",
    "seatPrice",
    "tablePromoPrice",
    "seatPromoPrice",
    "tableMembersPrice",
    "seatMembersPrice",
    "updatedAt"
) VALUES (
    'inventory',
    92,
    0,
    2800.00,
    280.00,
    NULL,
    NULL,
    2300.00,
    230.00,
    CURRENT_TIMESTAMP
);

-- Insert event settings
INSERT INTO "event_settings" (
    "id",
    "eventName",
    "eventDate",
    "eventVenue",
    "logoImageUrl",
    "footerLogoImageUrl",
    "siteIconUrl",
    "updatedAt"
) VALUES (
    'event',
    'ACS Founders'' Day Dinner 140 Years',
    '2025-02-28 19:00:00+08',
    'Anglo-Chinese School (Independent), Singapore',
    '/images/acs-140-logo.jpg',
    '/images/acs-logo.png',
    '/images/acs-140-siteicon.png',
    CURRENT_TIMESTAMP
);

-- Create 92 tables (T01-T92)
INSERT INTO "tables" ("id", "tableNumber", "capacity", "status", "tableHash", "createdAt", "updatedAt")
SELECT
    'table-' || lpad(i::text, 2, '0'),
    'T' || lpad(i::text, 2, '0'),
    10,
    'AVAILABLE'::"TableStatus",
    'hash-' || i::text,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 92) AS s(i);

-- Create sample voucher
INSERT INTO "vouchers" (
    "id",
    "code",
    "name",
    "notes",
    "type",
    "discountPercent",
    "maxRedemptions",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES (
    'voucher-10-percent',
    'ACS10OFF',
    'ACS 10% Discount',
    '10% discount for ACS alumni',
    'PERCENTAGE'::"VoucherType",
    10.00,
    100,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ===========================================
-- GRANT PERMISSIONS TO POSTGRES USER
-- ===========================================

-- Grant all privileges on all tables to postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Grant permissions on schema
GRANT ALL ON SCHEMA public TO postgres;

-- Grant permissions to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Check admin user
SELECT id, email, name FROM "admins" WHERE email = 'admin@acsoba.org';

-- Check table count
SELECT COUNT(*) as total_tables FROM "tables";

-- Check inventory settings
SELECT * FROM "inventory_settings";

-- Check permissions
SELECT
    grantee,
    privilege_type
FROM
    information_schema.role_table_grants
WHERE
    grantee = 'postgres';