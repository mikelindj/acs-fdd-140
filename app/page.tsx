import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnifrakturMaguntia } from "next/font/google"
import Image from "next/image"
import { PricingCard } from "@/components/PricingCard";
import { prisma } from "@/lib/prisma"
import { getEventSettings } from "@/lib/event-settings"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"

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
  const eventDate = eventSettings.eventDate
  const eventVenue = eventSettings.eventVenue

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
      {/* FIX: Changed 'absolute' to 'relative'. 
          This ensures the header takes up its own space so it doesn't overlap the Hero. 
      */}
      <header className="relative z-50 w-full bg-white bg-wavy-pattern border-b border-slate-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
          <div className="flex items-center">
             {/* ACS 140 Logo (Big) */}
             <div className="relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300">
               <img 
                 src="/images/acs-140-logo.jpg" 
                 alt="ACS 140 Years" 
                 className="object-contain w-full h-full"
               />
             </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
             {/* Navigation Items (Empty) */}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        {/* --- HERO SECTION --- */}
        {/* FIX: Removed 'pt-36'. We can use standard padding now that the header is relative. */}
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
                  <Link href="#pricing">
                    <Button className="h-14 px-8 bg-secondary text-primary hover:bg-white hover:scale-105 transition-all font-bold text-base rounded-lg shadow-[0_0_20px_rgba(255,198,41,0.2)]">
                      Reserve Table
                    </Button>
                  </Link>
               </div>
            </div>

            {/* Right Col: ACS Crest Logo inside the Card */}
            <div className="flex justify-center perspective-1000 order-1 lg:order-2">
               <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl transform hover:rotate-y-6 transition-transform duration-500 ease-out">
                  
                  {/* The ACS Crest Logo */}
                  <div className="mb-8 flex justify-center">
                    <img 
                       src="/images/acs-logo.png" 
                       alt="ACS Crest" 
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
                             {eventDate ? new Date(eventDate).toLocaleDateString('en-US', { 
                               weekday: 'long', 
                               year: 'numeric', 
                               month: 'long', 
                               day: 'numeric' 
                             }) : 'TBA'}
                           </p>
                        </div>
                     </div>

                     {eventVenue && (
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
<section id="pricing" className="py-24 bg-slate-50 relative">
  <div className="container mx-auto px-4 max-w-5xl relative z-10">
    <div className="text-center mb-16 space-y-4">
       <h2 className="text-3xl md:text-5xl font-bold text-primary">Reserve Your Seat</h2>
       <p className="text-slate-600 text-lg max-w-2xl mx-auto">
         Choose from VIP, School, OBA, or Guest categories. All tables accommodate 10-11 guests.
       </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
       
       {/* 2. USE THE COMPONENT FOR FULL TABLE */}
       <PricingCard 
         title="Full Table"
         subtitle="Best for groups & reunions"
         price="$1,000"
         priceDetail="/ table"
         features={[
           "Priority seating location",
           "10-11 Guest tickets included",
           "Custom Table Signage"
         ]}
         href="/book"
         isPopular={false}
         buttonText="Book Full Table"
         variant="default"
       />

       {/* 3. USE THE COMPONENT FOR INDIVIDUAL SEAT */}
       <PricingCard 
         title="Individual Seat"
         subtitle="For single guests"
         price="$100"
         priceDetail="/ person"
         features={[
           "Open seating assignment",
           "1 Guest ticket included",
           "Networking opportunities"
         ]}
         href="/book"
         isPopular={false}
         buttonText="Book Individual Seat"
         variant="outline"
       />
        <section id="pricing" className="py-24 bg-white bg-wavy-pattern relative">
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold text-primary">Reserve Your Seat</h2>
               <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                 Choose from tables, or individual seats or
                 jumbo tables of up to eleven pax!.
               </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               {/* Full Table Card */}
               <div className="group relative p-10 rounded-[2rem] bg-white bg-wavy-pattern border border-slate-200 shadow-sm hover:shadow-2xl hover:border-brand-red/30 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-10 left-0 w-[calc(100%+5rem)] -ml-10 h-1.5 bg-gradient-to-r from-primary via-brand-red to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">Full Table</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Best for groups & reunions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline text-slate-900 mb-8">
                    <span className="text-5xl font-bold tracking-tight">{formatPrice(tablePrice)}</span>
                    <span className="ml-2 text-base font-medium text-slate-500">/ table</span>
                    {tableMembersPrice && (
                      <span className="ml-3 text-sm font-medium text-green-600">
                        (Members: {formatPrice(tableMembersPrice)})
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600 mb-10">
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      Priority seating location
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      10-11 Guest tickets included
                    </li>
                    <li className="flex gap-3 items-center">
                       <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground text-xs font-bold">✓</div> 
                      Custom Table Signage
                    </li>
                  </ul>
                  
                  <Link href="/book" className="block w-full">
                    <Button className="w-full h-14 text-base font-bold bg-primary hover:bg-brand-red transition-colors rounded-xl shadow-lg hover:shadow-brand-red/25">
                      Book Full Table
                    </Button>
                  </Link>
               </div>

               {/* Individual Seat Card */}
               <div className="group relative p-10 rounded-[2rem] bg-white bg-wavy-pattern border border-slate-200 shadow-sm hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 overflow-hidden">
                  <div className="absolute -top-10 left-0 w-[calc(100%+5rem)] -ml-10 h-1.5 bg-gradient-to-r from-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 z-10" />

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Individual Seat</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">For single guests</p>
                  </div>
                  
                  <div className="flex items-baseline text-slate-900 mb-8">
                    <span className="text-5xl font-bold tracking-tight">{formatPrice(seatPrice)}</span>
                    <span className="ml-2 text-base font-medium text-slate-500">/ person</span>
                    {seatMembersPrice && (
                      <span className="ml-3 text-sm font-medium text-green-600">
                        (Members: {formatPrice(seatMembersPrice)})
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4 text-sm text-slate-600 mb-10">
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      Open seating assignment
                    </li>
                    <li className="flex gap-3 items-center">
                      <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      1 Guest ticket included
                    </li>
                    <li className="flex gap-3 items-center">
                       <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">✓</div> 
                      Networking opportunities
                    </li>
                  </ul>
                  
                  <Link href="/book" className="block w-full">
                    <Button variant="outline" className="w-full h-14 text-base font-bold border-2 border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 rounded-xl transition-all">
                      Book Individual Seat
                    </Button>
                  </Link>
               </div>
            </div>

    </div>
  </div>
</section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3">
               <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                  <img 
                    src="/images/acs-logo.png" 
                    alt="ACS Logo" 
                    className="object-contain w-full h-full"
                  />
               </div>
               <span className="font-bold text-white tracking-tight">ACS OBA</span>
           </div>
           
           <div className="text-center text-white md:text-right">
              © 140th ACS OBA FOUNDERS DAY DINNER, 2026
              <p className="text-xs text-slate-400 mt-2">This page designed and built by <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
           </div>
        </div>
      </footer>
    </div>
  )
}