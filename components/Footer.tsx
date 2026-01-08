"use client"

import Image from "next/image"
import { useState } from "react"

interface FooterProps {
  eventName?: string | null
  footerLogoImageUrl?: string | null
}

export function Footer({ 
  eventName = "140th ACS OBA FOUNDERS DAY DINNER",
  footerLogoImageUrl 
}: FooterProps) {
  const defaultLogo = "/images/acs-logo.png"
  const [imgSrc, setImgSrc] = useState(footerLogoImageUrl || defaultLogo)

  return (
    <footer className="bg-slate-900 border-t border-slate-700 py-12">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-3">
             <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
                <Image 
                  src={imgSrc} 
                  alt="ACS Logo" 
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                  onError={() => setImgSrc(defaultLogo)}
                />
             </div>
             <span className="font-bold text-white tracking-tight">{eventName}</span>
         </div>
         
         <div className="text-center text-white md:text-right">
            © The ACS Old Boys&apos; Association (ACSOBA)
            <p className="text-[0.5rem] text-slate-400 mt-2">This page is designed and built by ACSOBA Volunteers: <a href="https://nofa.io" className="hover:text-white transition-colors">Michael Lin</a> and <a href="https://github.com/kennethch22" className="hover:text-white transition-colors">Kenneth Hendra</a></p>
         </div>
      </div>
    </footer>
  )
}

