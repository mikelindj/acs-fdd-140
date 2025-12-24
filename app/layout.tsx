import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { getEventSettings } from "@/lib/event-settings"

// Configure Poppins
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export async function generateMetadata(): Promise<Metadata> {
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const description = eventSettings.eventVenue 
    ? `Join us for ${eventName}${eventSettings.eventDate ? ` on ${new Date(eventSettings.eventDate).toLocaleDateString()}` : ""} at ${eventSettings.eventVenue}.`
    : "Celebrating 140 Years of Excellence. Join us for the ACS Founders' Day Dinner."
  
  const siteIcon = eventSettings.siteIconUrl || "/images/acs-140-siteicon.png"
  
  return {
    title: eventName,
    description,
    icons: {
      icon: siteIcon,
      shortcut: siteIcon,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased bg-slate-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}