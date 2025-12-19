import Link from "next/link"
import { ArrowRight, Star, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnifrakturMaguntia } from "next/font/google"
import Image from "next/image"
import { PricingCard } from "@/components/PricingCard";

// 1. Configure the Old English Font
const oldFont = UnifrakturMaguntia({ 
  weight: "400", 
  subsets: ["latin"],
  variable: "--font-old",
})

export default function HomePage() {
  return (
    <div className={`min-h-screen flex flex-col bg-white font-sans selection:bg-brand-red selection:text-white ${oldFont.variable}`}>
      
      {/* --- HEADER --- */}
      {/* FIX: Changed 'absolute' to 'relative'. 
          This ensures the header takes up its own space so it doesn't overlap the Hero. 
      */}
      <header className="relative z-50 w-full bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-32 md:h-40 flex items-center justify-between">
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
        <section className="relative w-full min-h-[85vh] bg-primary overflow-hidden flex items-center py-12 md:py-0">
          
          {/* Background Watermark (Giant 140) */}
          <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 font-old text-[25rem] md:text-[40rem] text-white opacity-[0.03] leading-none select-none z-0 pointer-events-none">
            140
          </div>
          
          {/* Decorative Top Strokes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-brand-red to-primary" />

          <div className="container relative z-10 px-4 grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Col: Text */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
               
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1]">
                 ACS Founder&apos;s <br/>
                 <span className="relative inline-block">
                    <span className="relative z-10">Day Dinner</span>
                    {/* Yellow highlighter stroke behind text */}
                    <span className="absolute bottom-2 left-0 w-full h-4 bg-secondary/90 -rotate-1 z-0 mix-blend-multiply" />
                 </span>
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
                           <p className="text-white font-semibold text-lg">1 March 2026</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="p-2 bg-brand-red rounded-lg text-white shadow-lg">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                           <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Venue</p>
                           <p className="text-white font-semibold text-lg">Shangri-La Jakarta</p>
                        </div>
                     </div>
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

    </div>
  </div>
</section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="relative h-10 w-10">
                  <img 
                    src="/images/acs-logo.png" 
                    alt="ACS Logo" 
                    className="object-contain w-full h-full"
                  />
               </div>
               <span className="font-bold text-primary tracking-tight">ACS COMMUNITY</span>
           </div>
           
           <div className="text-center md:text-right">
              <a href="mailto:events@acs.edu.sg" className="text-sm font-medium text-slate-500 hover:text-brand-red transition-colors">
                events@acs.edu.sg
              </a>
              <p className="text-xs text-slate-400 mt-2">© 2026 ACS Founders&apos; Day Committee</p>
           </div>
        </div>
      </footer>
    </div>
  )
}