import Image from "next/image"

interface FooterProps {
  eventName?: string | null
  footerLogoImageUrl?: string | null
}

export function Footer({ 
  eventName = "140th ACS OBA FOUNDERS DAY DINNER",
  footerLogoImageUrl 
}: FooterProps) {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-12">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3">
             <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                <Image 
                  src={footerLogoImageUrl || "/images/acs-logo.png"} 
                  alt="ACS Logo" 
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
             </div>
             <span className="font-bold text-white tracking-tight">{eventName}</span>
         </div>
         
         <div className="text-center text-white md:text-right">
            © {new Date().getFullYear()} {eventName}
            <p className="text-[0.5rem] text-slate-400 mt-2">This page designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
         </div>
      </div>
    </footer>
  )
}

