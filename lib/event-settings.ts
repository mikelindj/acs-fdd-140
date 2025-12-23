import { prisma } from "@/lib/prisma"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"

export async function getEventSettings() {
  try {
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "event" },
    })
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetched event settings from DB:', settings)
    }
    
    return settings || {
      id: "event",
      eventName: null,
      eventDate: null,
      eventVenue: null,
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam when DB is unavailable
    if (error instanceof PrismaClientInitializationError) {
      // Database connection error - log it for debugging
      console.error("Database connection error fetching event settings:", error.message)
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
