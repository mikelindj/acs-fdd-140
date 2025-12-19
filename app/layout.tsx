import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

// Configure Poppins
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ACS Founders' Day Dinner - 140 Years",
  description: "Celebrating 140 Years of Excellence. Join us for the ACS Founders' Day Dinner.",
  icons: {
    icon: "/images/acs-logo.png", // Points to your existing logo
    shortcut: "/images/acs-logo.png",
    apple: "/images/acs-logo.png",
  },
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