import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })

    if (!settings) {
      settings = await prisma.eventSettings.create({
        data: {
          id: "event",
          eventName: null,
          eventDate: null,
          eventVenue: null,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching event settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventName, eventDate, eventVenue } = body

    // Normalize empty strings to null
    const normalizedEventName = eventName?.trim() || null
    const normalizedEventVenue = eventVenue?.trim() || null
    
    const settings = await prisma.eventSettings.upsert({
      where: { id: "event" },
      update: {
        eventName: normalizedEventName ?? undefined,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        eventVenue: normalizedEventVenue ?? undefined,
      },
      create: {
        id: "event",
        eventName: normalizedEventName,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventVenue: normalizedEventVenue,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating event settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
