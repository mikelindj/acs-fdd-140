import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"

export async function getEventSettings() {
  try {
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })
    return settings || {
      id: "event",
      eventName: null,
      eventDate: null,
      eventVenue: null,
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam when DB is unavailable
    if (error instanceof PrismaClientInitializationError) {
      // Database connection error - silently return defaults
      return {
        id: "event",
        eventName: null,
        eventDate: null,
        eventVenue: null,
      }
    }
    console.error("Error fetching event settings:", error)
    return {
      id: "event",
      eventName: null,
      eventDate: null,
      eventVenue: null,
    }
  }
}
