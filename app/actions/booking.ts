"use server"

import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { generateTableHash, generateInviteCode } from "@/lib/crypto"
import { createHitPayPayment } from "@/lib/hitpay"
import { z } from "zod"

export async function createBooking(data: z.infer<typeof bookingSchema>) {
  try {
    const validated = bookingSchema.parse(data)

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
      // Count existing PAID and PENDING table bookings to prevent overbooking
      const existingTableBookings = await prisma.booking.findMany({
        where: {
          type: "TABLE",
          status: { in: ["PAID", "PENDING"] },
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
      // Check seat availability (count both PAID and PENDING to prevent overbooking)
      const existingSeatBookings = await prisma.booking.findMany({
        where: {
          type: "SEAT",
          status: { in: ["PAID", "PENDING"] },
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

    // Check for table bundle discount (manually applied by user)
    const hasTableBundleDiscount = !isTable && validated.tableDiscountApplied === true

    if (isElevenSeater) {
      // 11-seater = 1 table (10-seater) + 1 seat
      subtotal = (tablePrice + seatPrice) * validated.quantity
    } else if (isTable) {
      // 10-seater table
      subtotal = tablePrice * validated.quantity
    } else {
      // Individual seat
      if (hasTableBundleDiscount) {
        // Apply table bundle discount: fixed price of $2100 for 10 seats
        subtotal = 2100
      } else {
        subtotal = seatPrice * validated.quantity
      }
    }

    // Validate and apply voucher if provided
    let voucherId: string | undefined = undefined
    if (validated.voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: validated.voucherCode.toUpperCase().trim() },
      })

      if (!voucher) {
        return { error: "Invalid voucher code" }
      }

      if (!voucher.isActive) {
        return { error: "Voucher is not active" }
      }

      if (voucher.currentRedemptions >= voucher.maxRedemptions) {
        return { error: "Voucher has reached maximum redemptions" }
      }

      if (voucher.expiresAt && new Date() > voucher.expiresAt) {
        return { error: "Voucher has expired" }
      }

      voucherId = voucher.id

      // Apply voucher discount to subtotal
      if (voucher.type === "PERCENTAGE" && voucher.discountPercent) {
        const discountPercent = Number(voucher.discountPercent)
        const discount = (subtotal * discountPercent) / 100
        subtotal = Math.max(0, subtotal - discount)
      } else if (voucher.type === "FIXED_AMOUNT" && voucher.discountAmount) {
        subtotal = Math.max(0, subtotal - Number(voucher.discountAmount))
      } else if (voucher.type === "FIXED_PRICE" && voucher.fixedPrice) {
        subtotal = Number(voucher.fixedPrice) * validated.quantity
      }
    }

    // No transaction fee charged to customers
    const transactionFee = 0
    const totalAmount = Math.round(subtotal * 100) / 100

    // If total amount is 0 (e.g., voucher covers full amount), handle as free booking
    const isFreeBooking = totalAmount === 0

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

    // Check for recent duplicate bookings (within last 60 seconds) to prevent double-submission
    // This helps prevent race conditions from rapid form submissions
    // Match by buyer, type, quantity, and similar total amount
    const recentBookings = await prisma.booking.findMany({
      where: {
        buyerId: buyer.id,
        type: validated.type,
        quantity: validated.quantity,
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last 60 seconds
        },
      },
      include: {
        table: {
          select: {
            tableHash: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Find duplicate by comparing total amount (with tolerance for rounding)
    const recentDuplicate = recentBookings.find((b) => {
      const bookingAmount = Number(b.totalAmount)
      return Math.abs(bookingAmount - totalAmount) < 0.01 // Within 1 cent tolerance
    })

    if (recentDuplicate) {
      console.log(`[Duplicate Prevention] Duplicate booking detected for buyer ${buyer.id}, returning existing booking ${recentDuplicate.id} (status: ${recentDuplicate.status})`)
      // Return the existing booking instead of creating a new one
      const existingTableHash = recentDuplicate.table?.tableHash || null

      const redirectBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const trimSlash = (value: string) => value.replace(/\/+$/, "")
      
      if (isFreeBooking || recentDuplicate.status === "PAID") {
        // If free or already paid, redirect appropriately
        if (recentDuplicate.type === "SEAT") {
          return {
            success: true,
            bookingId: recentDuplicate.id,
            paymentUrl: `${trimSlash(redirectBase)}/payment/success?booking=${recentDuplicate.id}&status=completed`,
            tableHash: null,
            isFree: isFreeBooking || recentDuplicate.status === "PAID",
          }
        } else {
          return {
            success: true,
            bookingId: recentDuplicate.id,
            paymentUrl: `${trimSlash(redirectBase)}/manage?table=${existingTableHash}&paymentStatus=completed`,
            tableHash: existingTableHash,
            isFree: isFreeBooking || recentDuplicate.status === "PAID",
          }
        }
      } else {
        // If pending, redirect to payment
        const hitpayRedirectBase = process.env.HITPAY_RETURN_URL ?? process.env.NEXT_PUBLIC_SITE_URL
        if (hitpayRedirectBase && recentDuplicate.hitpayPaymentId) {
          // Try to get payment URL from HitPay if possible
          return {
            success: true,
            bookingId: recentDuplicate.id,
            paymentUrl: `${trimSlash(hitpayRedirectBase)}/redirect?booking=${recentDuplicate.id}`,
            tableHash: existingTableHash,
          }
        }
        // If no payment ID yet, return error to prevent duplicate
        return {
          error: "A booking is already being processed. Please wait a moment and check your email.",
        }
      }
    }

    // Use a transaction to ensure atomicity and prevent race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check for duplicates within the transaction to prevent race conditions
      const duplicateCheck = await tx.booking.findFirst({
        where: {
          buyerId: buyer.id,
          type: validated.type,
          quantity: validated.quantity,
          createdAt: {
            gte: new Date(Date.now() - 60000), // Last 60 seconds
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (duplicateCheck) {
        const duplicateAmount = Number(duplicateCheck.totalAmount)
        if (Math.abs(duplicateAmount - totalAmount) < 0.01) {
          throw new Error("DUPLICATE_BOOKING")
        }
      }

      // Re-check inventory inside transaction to prevent race conditions
      if (isTable) {
        const txExistingTableBookings = await tx.booking.findMany({
          where: {
            type: "TABLE",
            status: { in: ["PAID", "PENDING"] },
          },
          include: {
            table: true,
          },
        })

        if (isElevenSeater) {
          const txBookedElevenSeaters = txExistingTableBookings.filter(
            (b) => b.table?.capacity === 11
          ).length
          const txAvailable = inventorySettings.maxElevenSeaterTables - txBookedElevenSeaters

          if (validated.quantity > txAvailable) {
            throw new Error(`INVENTORY_EXCEEDED:Only ${txAvailable} eleven-seater table${txAvailable !== 1 ? 's' : ''} available. You requested ${validated.quantity}.`)
          }
        } else {
          const txBookedElevenSeaters = txExistingTableBookings.filter(
            (b) => b.table?.capacity === 11
          ).length
          const txBookedTenSeaters = txExistingTableBookings.filter(
            (b) => b.table?.capacity === 10
          ).length
          const txAvailable = inventorySettings.totalTables - txBookedElevenSeaters - txBookedTenSeaters

          if (validated.quantity > txAvailable) {
            throw new Error(`INVENTORY_EXCEEDED:Only ${txAvailable} ten-seater table${txAvailable !== 1 ? 's' : ''} available. You requested ${validated.quantity}.`)
          }
        }
      } else {
        const txExistingSeatBookings = await tx.booking.findMany({
          where: {
            type: "SEAT",
            status: { in: ["PAID", "PENDING"] },
          },
        })

        const txBookedSeats = txExistingSeatBookings.reduce((sum, booking) => sum + booking.quantity, 0)
        const txTotalAvailableSeats = (inventorySettings.totalTables * 10) + inventorySettings.maxElevenSeaterTables
        const txAvailable = txTotalAvailableSeats - txBookedSeats

        if (validated.quantity > txAvailable) {
          throw new Error(`INVENTORY_EXCEEDED:Only ${txAvailable} seat${txAvailable !== 1 ? 's' : ''} available. You requested ${validated.quantity}.`)
        }
      }

      // Create booking - if free, mark as PAID immediately
      const newBooking = await tx.booking.create({
        data: {
          type: validated.type,
          category: validated.category,
          quantity: validated.quantity,
          totalAmount,
          transactionFee,
          balanceDue: isFreeBooking ? 0 : totalAmount,
          buyerId: buyer.id,
          status: isFreeBooking ? 'PAID' : 'PENDING',
          wantsBatchSeating: validated.wantsBatchSeating ?? false,
          cuisine: validated.cuisine ?? null,
          voucherId: voucherId,
        },
      })

      // Increment voucher redemption count if voucher was used
      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: {
            currentRedemptions: {
              increment: 1,
            },
          },
        })
      }

      return newBooking
    }).catch((error) => {
      if (error.message === "DUPLICATE_BOOKING") {
        // Return null to indicate duplicate was detected
        return null
      }
      if (error.message?.startsWith("INVENTORY_EXCEEDED:")) {
        // Return the inventory error message
        const errorMessage = error.message.replace("INVENTORY_EXCEEDED:", "")
        return { inventoryError: errorMessage }
      }
      throw error
    })

    // If inventory exceeded error was detected in transaction, return error
    if (booking && typeof booking === 'object' && 'inventoryError' in booking) {
      return { error: booking.inventoryError }
    }

    // If duplicate was detected in transaction, return existing booking
    if (!booking) {
      // Fetch the duplicate booking that was found
      const duplicate = await prisma.booking.findFirst({
        where: {
          buyerId: buyer.id,
          type: validated.type,
          quantity: validated.quantity,
          createdAt: {
            gte: new Date(Date.now() - 60000),
          },
        },
        include: {
          table: {
            select: {
              tableHash: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      if (duplicate) {
        const duplicateAmount = Number(duplicate.totalAmount)
        if (Math.abs(duplicateAmount - totalAmount) < 0.01) {
          console.log(`[Transaction] Duplicate booking prevented for buyer ${buyer.id}, returning existing booking ${duplicate.id}`)
          const existingTableHash = duplicate.table?.tableHash || null
          const redirectBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          const trimSlash = (value: string) => value.replace(/\/+$/, "")
          
          if (isFreeBooking || duplicate.status === "PAID") {
            if (duplicate.type === "SEAT") {
              return {
                success: true,
                bookingId: duplicate.id,
                paymentUrl: `${trimSlash(redirectBase)}/payment/success?booking=${duplicate.id}&status=completed`,
                tableHash: null,
                isFree: isFreeBooking || duplicate.status === "PAID",
              }
            } else {
              return {
                success: true,
                bookingId: duplicate.id,
                paymentUrl: `${trimSlash(redirectBase)}/manage?table=${existingTableHash}&paymentStatus=completed`,
                tableHash: existingTableHash,
                isFree: isFreeBooking || duplicate.status === "PAID",
              }
            }
          } else {
            const hitpayRedirectBase = process.env.HITPAY_RETURN_URL ?? process.env.NEXT_PUBLIC_SITE_URL
            if (hitpayRedirectBase && duplicate.hitpayPaymentId) {
              return {
                success: true,
                bookingId: duplicate.id,
                paymentUrl: `${trimSlash(hitpayRedirectBase)}/redirect?booking=${duplicate.id}`,
                tableHash: existingTableHash,
              }
            }
            return {
              error: "A booking is already being processed. Please wait a moment and check your email.",
            }
          }
        }
      }
      return { error: "Duplicate booking detected. Please try again." }
    }

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

    // If booking is free (totalAmount === 0), skip payment and send confirmation email
    if (isFreeBooking) {
      // Send confirmation email for free booking
      try {
        const [{ sendEmail }, { getPurchaseConfirmationEmail }] = await Promise.all([
          import("@/lib/email"),
          import("@/lib/email-templates"),
        ])

        const buyerEmail = validated.buyerEmail
        const buyerName = validated.buyerName

        // Prepare booking data for email
        const bookingData = [{
          id: booking.id,
          type: booking.type,
          quantity: booking.quantity,
          totalAmount: booking.totalAmount.toString(),
          tableHash: tableHash || null,
          tableNumber: null,
          tableCapacity: validated.tableCapacity || null,
          cuisine: validated.cuisine || null,
        }]

        // Send confirmation email
        console.log(`Sending confirmation email for free booking ${booking.id} to ${buyerEmail}`)
        await sendEmail({
          to: buyerEmail,
          subject: "Thank You for Your Purchase - ACS Founders' Day Dinner",
          html: await getPurchaseConfirmationEmail(buyerName, bookingData),
        })
        console.log(`Confirmation email sent successfully for free booking ${booking.id}`)
      } catch (emailError) {
        console.error("Error sending confirmation email for free booking:", emailError)
        // Don't fail the booking if email fails
      }

      // Return appropriate redirect URL based on booking type
      const redirectBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const trimSlash = (value: string) => value.replace(/\/+$/, "")
      
      if (booking.type === "SEAT") {
        // For seat bookings, redirect to success page
        return {
          success: true,
          bookingId: booking.id,
          paymentUrl: `${trimSlash(redirectBase)}/payment/success?booking=${booking.id}&status=completed`,
          tableHash: null,
          isFree: true,
        }
      } else {
        // For table bookings, redirect to manage page
        return {
          success: true,
          bookingId: booking.id,
          paymentUrl: `${trimSlash(redirectBase)}/manage?table=${tableHash}&paymentStatus=completed`,
          tableHash,
          isFree: true,
        }
      }
    }

    // For paid bookings, proceed with HitPay payment
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
      cuisine: booking.cuisine,
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
      // Format voucher Decimal and Date fields if exists
      voucher: booking.voucher
        ? {
            ...booking.voucher,
            discountPercent: booking.voucher.discountPercent ? Number(booking.voucher.discountPercent) : null,
            discountAmount: booking.voucher.discountAmount ? Number(booking.voucher.discountAmount) : null,
            fixedPrice: booking.voucher.fixedPrice ? Number(booking.voucher.fixedPrice) : null,
            expiresAt: booking.voucher.expiresAt ? booking.voucher.expiresAt.toISOString() : null,
            createdAt: booking.voucher.createdAt.toISOString(),
            updatedAt: booking.voucher.updatedAt.toISOString(),
          }
        : null,
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

