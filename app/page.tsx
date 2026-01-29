import Image from "next/image"
import { Calendar, MapPin, AlertCircle } from "lucide-react"
import { UnifrakturMaguntia } from "next/font/google"
import { prisma } from "@/lib/prisma"
import { getEventSettings } from "@/lib/event-settings"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"
import { Logo } from "@/components/Logo"
import { Footer } from "@/components/Footer"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 1. Configure the Old English Font
const oldFont = UnifrakturMaguntia({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-old",
})

function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default async function HomePage() {
  // Fetch pricing from inventory settings
  let tablePrice = 1000
  let seatPrice = 100
  let tableMembersPrice: number | null = null
  let seatMembersPrice: number | null = null

  // Fetch event settings
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  // eventDate from Prisma is a Date object or null
  const eventDate = eventSettings.eventDate
  // Handle venue - trim whitespace but preserve the value
  const eventVenue = eventSettings.eventVenue ? eventSettings.eventVenue.trim() : null
  
  // Debug logging (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('Event Settings:', {
      eventName: eventSettings.eventName,
      eventDate: eventSettings.eventDate,
      eventVenue: eventSettings.eventVenue,
      processedVenue: eventVenue,
    })
  }

  try {
    const settings = await prisma.inventorySettings.findUnique({
      where: { id: "inventory" },
    })

    if (settings) {
      tablePrice = Number(settings.tablePrice)
      seatPrice = Number(settings.seatPrice)
      tableMembersPrice = settings.tableMembersPrice ? Number(settings.tableMembersPrice) : null
      seatMembersPrice = settings.seatMembersPrice ? Number(settings.seatMembersPrice) : null
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam when DB is unavailable
    if (!(error instanceof PrismaClientInitializationError)) {
      console.error("Error fetching pricing:", error)
    }
    // Use defaults if fetch fails
  }


  return (
    <div className={`min-h-screen flex flex-col bg-white bg-wavy-pattern font-sans selection:bg-brand-red selection:text-white ${oldFont.variable}`}>
      
      {/* --- HEADER --- */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* Event Logo */}
             <Logo 
               logoUrl={eventSettings.logoImageUrl} 
               alt={eventName}
               priority
               linkToHome={false}
             />
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full min-h-[85vh] bg-primary overflow-hidden flex items-center py-12 md:py-16">
          
          {/* Background Watermark (Giant 140) */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 font-old text-[25rem] md:text-[40rem] text-white opacity-[0.03] leading-none select-none z-0 pointer-events-none">
            140
          </div>
          
          {/* Decorative Top Strokes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-brand-red to-primary" />

          <div className="container max-w-6xl relative z-10 px-4 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Col: Text */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
               
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1]">
                 {eventName}
               </h1>
               
               <p className="text-slate-300 text-lg md:text-xl max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
                 Join the entire ACS family for a prestigious evening of celebration, networking, and nostalgia.
               </p>

               <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-3 h-14 px-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-base rounded-lg">
                    <AlertCircle className="w-5 h-5 text-secondary" />
                    <span>Event Sold Out</span>
                  </div>
               </div>
            </div>

            {/* Right Col: ACS Crest Logo inside the Card */}
            <div className="flex justify-center perspective-1000 order-1 lg:order-2">
               <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl transform hover:rotate-y-6 transition-transform duration-500 ease-out">
                  
                  {/* The ACS Crest Logo */}
                  <div className="mb-8 flex justify-center">
                    <Image 
                       src="/images/acs-logo.png" 
                       alt="ACS Crest" 
                       width={160}
                       height={160}
                       className="h-40 object-contain drop-shadow-xl"
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent my-6" />
                  
                  {/* Event Details */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="p-2 bg-secondary rounded-lg text-primary shadow-lg">
                           <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Date</p>
                           <p className="text-white font-semibold text-lg">
                             {eventDate ? eventDate.toLocaleDateString('en-US', { 
                               weekday: 'long', 
                               year: 'numeric', 
                               month: 'long', 
                               day: 'numeric' 
                             }) : 'TBA'}
                           </p>
                        </div>
                     </div>

                     {eventVenue && eventVenue.length > 0 && (
                     <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="p-2 bg-brand-red rounded-lg text-white shadow-lg">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Venue</p>
                           <p className="text-white font-semibold text-lg">{eventVenue}</p>
                        </div>
                     </div>
                     )}
                  </div>

               </div>
            </div>

          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <section id="pricing" className="py-24 bg-white bg-wavy-pattern relative">
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            {/* Sold Out Banner */}
            <div className="mb-12 p-6 bg-brand-red/10 border border-brand-red/20 rounded-2xl max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-red rounded-lg text-white flex-shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-red mb-2">Event Sold Out</h3>
                  <p className="text-slate-600">
                    Thank you for your overwhelming support! All tables and seats have been sold out.
                  </p>
                  <p className="text-slate-600 mt-2">
                    For enquiries, please contact us at{" "}
                    <a href="mailto:admin@acsoba.org" className="text-primary font-semibold hover:underline">
                      admin@acsoba.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold text-primary">Ticket Prices</h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                 10-seater tables and individual seats.
               </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
               
               {/* 1. 10-Seater Table Card */}
               <div className="group relative p-8 rounded-[2rem] bg-white bg-wavy-pattern border border-slate-200 shadow-sm hover:shadow-2xl hover:border-brand-red/30 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-10 left-0 w-[calc(100%+5rem)] -ml-10 h-1.5 bg-gradient-to-r from-primary via-brand-red to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">10-Seater Table</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Standard full table</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col text-slate-900 mb-8">
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight">{formatPrice(tablePrice)}</span>
                        <span className="ml-2 text-sm font-medium text-slate-500">/ table</span>
                    </div>
                    {tableMembersPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        (Members: {formatPrice(tableMembersPrice)})
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600 mb-10">
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      10 tickets to the Shangri-La Dinner
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      Private table just for your own guests
                    </li>
                    <li className="flex gap-3 items-center">
                       <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      Seated around or near your batch or group
                    </li>
                  </ul>
                  
                  <div className="w-full h-14 text-base font-bold bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Sold Out
                  </div>
               </div>

               {/* 2. Individual Seat Card */}
               <div className="group relative p-8 rounded-[2rem] bg-white bg-wavy-pattern border border-slate-200 shadow-sm hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-10 left-0 w-[calc(100%+5rem)] -ml-10 h-1.5 bg-gradient-to-r from-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Individual Seat</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">For single guests</p>
                  </div>
                  
                  <div className="flex flex-col text-slate-900 mb-8">
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold tracking-tight">{formatPrice(seatPrice)}</span>
                        <span className="ml-2 text-sm font-medium text-slate-500">/ person</span>
                    </div>
                    {seatMembersPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        (Members: {formatPrice(seatMembersPrice)})
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600 mb-10">
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      Open seating assignment (unless purchased in groups of 10)
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      Cuisine options for Chinese, Vegetarian, or Halal
                    </li>
                    <li className="flex gap-3 items-center">
                       <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      Networking opportunities
                    </li>
                  </ul>
                  
                  <div className="w-full h-14 text-base font-bold bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Sold Out
                  </div>
               </div>
            </div>

          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <Footer eventName={eventName} footerLogoImageUrl={eventSettings.footerLogoImageUrl} />
    </div>
  )
}