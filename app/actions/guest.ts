"use server"

import { prisma } from "@/lib/prisma"
import { guestRegistrationSchema } from "@/lib/validations"
import { z } from "zod"

export async function registerGuest(data: z.infer<typeof guestRegistrationSchema>) {
  try {
    const validated = guestRegistrationSchema.parse(data)

    // Find invite code
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: validated.inviteCode },
      include: { booking: true },
    })

    if (!inviteCode) {
      return { error: "Invalid invite code" }
    }

    if (inviteCode.claimedAt) {
      return { error: "This invite code has already been used" }
    }

    // Create guest
    const guest = await prisma.guest.create({
      data: {
        name: validated.name,
        email: validated.email,
        mobile: validated.mobile,
        birthYear: validated.birthYear,
        school: validated.school,
        gradYear: validated.gradYear,
        dietary: validated.dietary,
      },
    })

    // Update invite code
    await prisma.inviteCode.update({
      where: { id: inviteCode.id },
      data: {
        guestId: guest.id,
        claimedAt: new Date(),
      },
    })

    // Add guest to booking
    await prisma.booking.update({
      where: { id: inviteCode.bookingId },
      data: {
        guests: {
          connect: { id: guest.id },
        },
      },
    })

    return { success: true, guestId: guest.id }
  } catch (error) {
    console.error('Guest registration error:', error)
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to register guest" }
  }
}

