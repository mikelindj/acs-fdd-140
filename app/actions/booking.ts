"use server"

import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { generateTableHash, generateInviteCode } from "@/lib/crypto"
import { createHitPayPayment } from "@/lib/hitpay"
import { validateMembershipNumber } from "@/lib/membership"
import { z } from "zod"

export async function createBooking(data: z.infer<typeof bookingSchema>) {
  try {
    const validated = bookingSchema.parse(data)

    // Validate membership if provided
    if (validated.membershipNo) {
      const isValid = await validateMembershipNumber(validated.membershipNo)
      if (!isValid) {
        return { error: "Invalid membership number" }
      }
    }

    // Fetch inventory settings for dynamic pricing
    const inventorySettings = await prisma.inventorySettings.findUnique({
      where: { id: "inventory" },
    })

    if (!inventorySettings) {
      return { error: "Inventory settings not configured" }
    }

    // Check inventory availability before proceeding
    const isTable = validated.type === 'TABLE'
    const isElevenSeater = isTable && validated.tableCapacity === 11

    if (isTable) {
      // Count existing PAID table bookings
      const existingTableBookings = await prisma.booking.findMany({
        where: {
          type: "TABLE",
          status: "PAID",
        },
        include: {
          table: true,
        },
      })

      if (isElevenSeater) {
        // Check 11-seater availability
        const bookedElevenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 11
        ).length
        const available = inventorySettings.maxElevenSeaterTables - bookedElevenSeaters

        if (validated.quantity > available) {
          return { 
            error: `Only ${available} eleven-seater table${available !== 1 ? 's' : ''} available. You requested ${validated.quantity}.` 
          }
        }
      } else {
        // Check 10-seater availability
        const bookedElevenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 11
        ).length
        const bookedTenSeaters = existingTableBookings.filter(
          (b) => b.table?.capacity === 10
        ).length
        const available = inventorySettings.totalTables - bookedElevenSeaters - bookedTenSeaters

        if (validated.quantity > available) {
          return { 
            error: `Only ${available} ten-seater table${available !== 1 ? 's' : ''} available. You requested ${validated.quantity}.` 
          }
        }
      }
    } else {
      // Check seat availability
      const existingSeatBookings = await prisma.booking.findMany({
        where: {
          type: "SEAT",
          status: "PAID",
        },
      })

      const bookedSeats = existingSeatBookings.reduce((sum, booking) => sum + booking.quantity, 0)
      const totalAvailableSeats = (inventorySettings.totalTables * 10) + inventorySettings.maxElevenSeaterTables
      const available = totalAvailableSeats - bookedSeats

      if (validated.quantity > available) {
        return { 
          error: `Only ${available} seat${available !== 1 ? 's' : ''} available. You requested ${validated.quantity}.` 
        }
      }
    }

    // Calculate pricing based on inventory settings
    // isTable and isElevenSeater already declared above
    const useMembersPrice = validated.membershipValidated && validated.membershipNo
    
    let tablePrice: number
    let seatPrice: number
    
    if (useMembersPrice) {
      // Use members price if validated
      tablePrice = Number(inventorySettings.tableMembersPrice || inventorySettings.tablePrice)
      seatPrice = Number(inventorySettings.seatMembersPrice || inventorySettings.seatPrice)
    } else {
      // Use promo price if available, otherwise base price
      tablePrice = Number(inventorySettings.tablePromoPrice || inventorySettings.tablePrice)
      seatPrice = Number(inventorySettings.seatPromoPrice || inventorySettings.seatPrice)
    }

    let subtotal: number
    if (isElevenSeater) {
      // 11-seater = 1 table (10-seater) + 1 seat
      subtotal = (tablePrice + seatPrice) * validated.quantity
    } else if (isTable) {
      // 10-seater table
      subtotal = tablePrice * validated.quantity
    } else {
      // Individual seat
      subtotal = seatPrice * validated.quantity
    }

    // No transaction fee charged to customers
    const transactionFee = 0
    const totalAmount = Math.round(subtotal * 100) / 100

    // Create or reuse buyer guest (email is unique)
    const buyer = await prisma.guest.upsert({
      where: { email: validated.buyerEmail },
      update: {
        name: validated.buyerName,
        mobile: validated.buyerMobile,
        membershipNo: validated.membershipNo ?? undefined,
        school: validated.school ?? undefined,
        gradYear: validated.gradYear ?? undefined,
      },
      create: {
        name: validated.buyerName,
        email: validated.buyerEmail,
        mobile: validated.buyerMobile,
        membershipNo: validated.membershipNo,
        school: validated.school,
        gradYear: validated.gradYear,
      },
    })

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        type: validated.type,
        category: validated.category,
        quantity: validated.quantity,
        totalAmount,
        transactionFee,
        balanceDue: totalAmount,
        buyerId: buyer.id,
        status: 'PENDING',
        wantsBatchSeating: validated.wantsBatchSeating ?? false,
      },
    })

    // Generate table hash if it's a table booking
    let tableHash: string | null = null
    if (validated.type === 'TABLE') {
      tableHash = generateTableHash()
      // Create a table record (will be assigned later)
      // Use tableCapacity if provided, otherwise default to 11
      const capacity = validated.tableCapacity || 11
      await prisma.table.create({
        data: {
          tableNumber: `TEMP-${booking.id.substring(0, 8)}`,
          capacity,
          status: 'RESERVED',
          tableHash,
          bookingId: booking.id,
        },
      })
    }

    // Generate invite codes for guests
    const inviteCodes = []
    for (let i = 0; i < validated.quantity; i++) {
      const code = generateInviteCode()
      await prisma.inviteCode.create({
        data: {
          code,
          bookingId: booking.id,
          email: validated.buyerEmail,
        },
      })
      inviteCodes.push(code)
    }

    // Helper function to normalize URLs
    const trimSlash = (value: string) => value.replace(/\/+$/, "")
    const isLocalhost = (value: string) =>
      /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(value)

    // Get base URLs from environment variables
    // Priority: HITPAY_RETURN_URL > NEXT_PUBLIC_SITE_URL
    const redirectBase =
      process.env.HITPAY_RETURN_URL ?? process.env.NEXT_PUBLIC_SITE_URL
    const webhookBase =
      process.env.HITPAY_WEBHOOK_URL ??
      process.env.HITPAY_RETURN_URL ??
      process.env.NEXT_PUBLIC_SITE_URL

    if (!redirectBase || !webhookBase) {
      return {
        error:
          "Payment is not configured: set HITPAY_RETURN_URL (and HITPAY_WEBHOOK_URL or NEXT_PUBLIC_SITE_URL) to a public domain.",
      }
    }

    // Construct redirect URL - HitPay will append its own query parameters
    // Use 'booking' parameter to avoid conflicts with HitPay's 'reference' parameter
    const redirectUrl = `${trimSlash(redirectBase)}/redirect?booking=${booking.id}`
    const webhookUrl = `${trimSlash(webhookBase)}/api/webhooks/hitpay`

    // Check for localhost URLs (HitPay requires public HTTPS URLs)
    // Allow override via HITPAY_ALLOW_LOCALHOST for development/testing with tunneling services
    const allowLocalhost = process.env.HITPAY_ALLOW_LOCALHOST === "true"
    if (!allowLocalhost && (isLocalhost(redirectUrl) || isLocalhost(webhookUrl))) {
      console.error("HitPay requires public URLs for redirect/webhook", {
        redirectUrl,
        webhookUrl,
        hint: "For localhost testing, use a tunneling service (e.g., ngrok) and set HITPAY_RETURN_URL to the tunnel URL, or set HITPAY_ALLOW_LOCALHOST=true",
      })
      return {
        error:
          "Payment is not configured: HitPay needs public https URLs for redirect and webhook. Set HITPAY_RETURN_URL and HITPAY_WEBHOOK_URL to a public domain. For localhost testing, use a tunneling service or set HITPAY_ALLOW_LOCALHOST=true.",
      }
    }

    // Create HitPay payment request
    const payment = await createHitPayPayment({
      amount: totalAmount,
      email: validated.buyerEmail,
      name: validated.buyerName,
      referenceNumber: booking.id,
      redirectUrl,
      webhookUrl,
    })
    const paymentRequestId = payment.payment_request_id || payment.id

    // Update booking with payment ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { hitpayPaymentId: paymentRequestId },
    })

    return {
      success: true,
      bookingId: booking.id,
      paymentUrl: payment.url ?? payment.redirect_url,
      tableHash,
    }
  } catch (error) {
    console.error('Booking creation error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create booking" }
  }
}

export async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        buyer: true,
        table: {
          include: {
            guests: true,
          },
        },
        inviteCodes: {
          include: {
            guest: true,
          },
        },
        guests: true,
        voucher: true,
      },
    })

    if (!booking) {
      return { error: "Booking not found" }
    }

    // Convert Decimal fields to numbers for client component compatibility
    const formattedBooking = {
      ...booking,
      totalAmount: Number(booking.totalAmount),
      transactionFee: booking.transactionFee ? Number(booking.transactionFee) : null,
      balanceDue: Number(booking.balanceDue),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      // Format inviteCodes dates
      inviteCodes: booking.inviteCodes.map((invite) => ({
        ...invite,
        claimedAt: invite.claimedAt ? invite.claimedAt.toISOString() : null,
        expiresAt: invite.expiresAt ? invite.expiresAt.toISOString() : null,
        createdAt: invite.createdAt.toISOString(),
        updatedAt: invite.updatedAt.toISOString(),
      })),
      // Format table dates if exists
      table: booking.table
        ? {
            ...booking.table,
            createdAt: booking.table.createdAt.toISOString(),
            updatedAt: booking.table.updatedAt.toISOString(),
            // Format guests dates if exists
            guests: booking.table.guests.map((guest) => ({
              ...guest,
              createdAt: guest.createdAt.toISOString(),
              updatedAt: guest.updatedAt.toISOString(),
            })),
          }
        : null,
      // Format guests dates
      guests: booking.guests.map((guest) => ({
        ...guest,
        createdAt: guest.createdAt.toISOString(),
        updatedAt: guest.updatedAt.toISOString(),
      })),
      // Format buyer dates
      buyer: {
        ...booking.buyer,
        createdAt: booking.buyer.createdAt.toISOString(),
        updatedAt: booking.buyer.updatedAt.toISOString(),
      },
    }

    return { success: true, booking: formattedBooking }
  } catch (error) {
    console.error("Error fetching booking details:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to fetch booking details" }
  }
}

export async function deletePendingBooking(bookingId: string) {
  try {
    // First check if booking exists and is PENDING
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        table: true,
        inviteCodes: true,
      },
    })

    if (!booking) {
      return { error: "Booking not found" }
    }

    if (booking.status !== "PENDING") {
      return { error: "Only PENDING bookings can be deleted" }
    }

    // Delete the booking (cascade will handle related records)
    // But we need to manually delete table and invite codes first
    if (booking.table) {
      await prisma.table.delete({
        where: { id: booking.table.id },
      })
    }

    await prisma.inviteCode.deleteMany({
      where: { bookingId: booking.id },
    })

    await prisma.booking.delete({
      where: { id: bookingId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting booking:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete booking" }
  }
}

export async function bulkDeletePendingBookings(bookingIds: string[]) {
  try {
    if (!bookingIds || bookingIds.length === 0) {
      return { error: "No bookings selected" }
    }

    // Fetch all bookings to verify they are PENDING
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
      },
      include: {
        table: true,
        inviteCodes: true,
      },
    })

    // Check if all bookings are PENDING
    const nonPendingBookings = bookings.filter((b) => b.status !== "PENDING")
    if (nonPendingBookings.length > 0) {
      return {
        error: `Cannot delete: ${nonPendingBookings.length} booking(s) are not PENDING`,
      }
    }

    // Check if all requested bookings were found
    if (bookings.length !== bookingIds.length) {
      return { error: "Some bookings were not found" }
    }

    // Delete all related records
    const tablesToDelete = bookings.filter((b) => b.table).map((b) => b.table!.id)
    if (tablesToDelete.length > 0) {
      await prisma.table.deleteMany({
        where: { id: { in: tablesToDelete } },
      })
    }

    await prisma.inviteCode.deleteMany({
      where: { bookingId: { in: bookingIds } },
    })

    await prisma.booking.deleteMany({
      where: { id: { in: bookingIds } },
    })

    return { success: true, deletedCount: bookingIds.length }
  } catch (error) {
    console.error("Error bulk deleting bookings:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete bookings" }
  }
}

