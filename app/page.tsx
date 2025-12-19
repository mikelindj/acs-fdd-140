import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* ACS Logo Placeholder - Replace with local file if needed */}
             <div className="relative h-12 w-12">
               <img 
                 src="https://www.acsjakarta.sch.id/site/uploads/logo/5ac44dad0d439-acs-png-logo-edit-1.png" 
                 alt="ACS Logo" 
                 className="object-contain w-full h-full"
               />
             </div>
             <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-primary">ACS FOUNDERS&apos; DAY</span>
                <span className="text-xs font-medium tracking-wider text-slate-500">140 YEARS OF EXCELLENCE</span>
             </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#details" className="hover:text-primary transition-colors">Event Details</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Tables & Seats</Link>
            <Link href="mailto:events@acs.edu.sg" className="hover:text-primary transition-colors">Contact</Link>
            <Link 
              href="/book" 
              className="px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 transition-colors"
            >
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        
        {/* --- HERO SECTION --- */}
        <section className="relative bg-primary overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Content */}
              <div className="text-white space-y-6 relative z-10">
                <div className="inline-flex items-center rounded-md bg-secondary/20 px-3 py-1 text-sm font-bold text-secondary ring-1 ring-inset ring-secondary/50">
                  Celebrate 140 Years
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                  Honoring the Past, <br />
                  <span className="text-secondary">Building the Future.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-200 max-w-lg leading-relaxed">
                  Join alumni, staff, and friends of ACS for a prestigious evening of celebration, networking, and nostalgia at our 140th Founders&apos; Day Dinner.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link 
                    href="/book" 
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl"
                  >
                    Reserve Your Table <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    href="#details" 
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    View Event Details
                  </Link>
                </div>
              </div>

              {/* Dynamic Image/Graphic Area */}
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-800">
                    {/* Placeholder for Event Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10" />
                    <img 
                        src="https://www.acsjakarta.sch.id/site/uploads/images/63b4037b5e6f5-1-l.jpg" 
                        alt="Dinner Venue" 
                        className="object-cover w-full h-full opacity-90"
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                        <p className="text-white text-lg font-medium">Coming Together As One</p>
                        <p className="text-slate-300 text-sm">The ACS Family</p>
                    </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl hidden md:block">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date</p>
                        <p className="text-2xl font-bold text-primary">01 MAR</p>
                        <p className="text-sm font-medium text-slate-900">2026</p>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- EVENT DETAILS --- */}
        <section id="details" className="py-20 bg-slate-50">
           <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-3xl font-bold text-primary mb-4">Event Information</h2>
                 <p className="text-slate-600">Everything you need to know about the evening.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:border-secondary transition-colors group">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                       <Calendar className="w-7 h-7 text-primary group-hover:text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Date & Time</h3>
                    <p className="text-slate-600">Saturday, 1st March 2026</p>
                    <p className="text-slate-500 text-sm mt-1">6:00 PM Cocktail Reception</p>
                 </div>
                 
                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:border-secondary transition-colors group">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                       <MapPin className="w-7 h-7 text-primary group-hover:text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">The Venue</h3>
                    <p className="text-slate-600">Grand Ballroom</p>
                    <p className="text-slate-500 text-sm mt-1">Shangri-La Hotel, Jakarta</p>
                 </div>

                 <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:border-secondary transition-colors group">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                       <Users className="w-7 h-7 text-primary group-hover:text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Dress Code</h3>
                    <p className="text-slate-600">Formal / Black Tie</p>
                    <p className="text-slate-500 text-sm mt-1">School colors encouraged</p>
                 </div>
              </div>
           </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
               <div>
                  <h2 className="text-3xl font-bold text-primary mb-2">Secure Your Seats</h2>
                  <p className="text-slate-600">Choose from VIP, School, OBA, or Guest categories.</p>
               </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               {/* Full Table Card */}
               <div className="p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-primary/20 hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">BEST VALUE</div>
                  <h3 className="text-2xl font-bold text-slate-900">Full Table</h3>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-5xl font-bold tracking-tight text-primary">$1,000</span>
                    <span className="ml-2 text-sm font-semibold text-slate-500">/ table</span>
                  </div>
                  <p className="mt-4 text-slate-600">Perfect for class reunions or corporate groups. Seats 10-11 guests comfortably.</p>
                  <ul className="mt-8 space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> Priority seating location</li>
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> 10-11 Guest tickets included</li>
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> Company signage on table</li>
                  </ul>
                  <Link href="/book" className="mt-8 block w-full rounded-xl bg-primary px-3 py-4 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors">
                    Book Full Table
                  </Link>
               </div>

               {/* Individual Seat Card */}
               <div className="p-8 rounded-3xl border-2 border-slate-100 bg-slate-50 hover:border-primary/20 transition-all">
                  <h3 className="text-2xl font-bold text-slate-900">Individual Seat</h3>
                  <div className="mt-4 flex items-baseline text-slate-900">
                    <span className="text-5xl font-bold tracking-tight text-primary">$100</span>
                    <span className="ml-2 text-sm font-semibold text-slate-500">/ person</span>
                  </div>
                  <p className="mt-4 text-slate-600">Join a table and meet fellow alumni and friends of the school.</p>
                  <ul className="mt-8 space-y-3 text-sm text-slate-600">
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> Open seating assignment</li>
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> 1 Guest ticket included</li>
                    <li className="flex gap-3"><span className="text-secondary-foreground">✓</span> Networking opportunities</li>
                  </ul>
                  <Link href="/book" className="mt-8 block w-full rounded-xl bg-white border-2 border-primary px-3 py-4 text-center text-sm font-semibold text-primary hover:bg-slate-50 transition-colors">
                    Book Individual Seat
                  </Link>
               </div>
            </div>

          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-primary text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center md:text-left">
           <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                 <h4 className="text-xl font-bold text-secondary mb-4">ACS Founders&apos; Day</h4>
                 <p className="text-slate-300 text-sm max-w-sm">
                   Celebrating 140 years of history, community, and excellence. The Best Is Yet To Be.
                 </p>
              </div>
              <div>
                 <h5 className="font-semibold mb-4">Contact</h5>
                 <p className="text-slate-300 text-sm">events@acs.edu.sg</p>
                 <p className="text-slate-300 text-sm">+62 21 8459 7175</p>
              </div>
              <div>
                 <h5 className="font-semibold mb-4">Links</h5>
                 <ul className="space-y-2 text-sm text-slate-300">
                    <li><Link href="#" className="hover:text-secondary">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-secondary">Terms of Service</Link></li>
                 </ul>
              </div>
           </div>
           <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
              <p>&copy; 2025 ACS Jakarta. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  )
}