import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })

    if (!settings) {
      return NextResponse.json({
        eventName: null,
        eventDate: null,
        eventVenue: null,
        logoImageUrl: null,
        footerLogoImageUrl: null,
        siteIconUrl: null,
      })
    }

    return NextResponse.json({
      eventName: settings.eventName,
      eventDate: settings.eventDate,
      eventVenue: settings.eventVenue,
      logoImageUrl: settings.logoImageUrl ?? null,
      footerLogoImageUrl: settings.footerLogoImageUrl ?? null,
      siteIconUrl: settings.siteIconUrl ?? null,
    })
  } catch (error) {
    console.error("Error fetching public event settings:", error)
    return NextResponse.json({
      eventName: null,
      eventDate: null,
      eventVenue: null,
      logoImageUrl: null,
      footerLogoImageUrl: null,
      siteIconUrl: null,
    })
  }
}

