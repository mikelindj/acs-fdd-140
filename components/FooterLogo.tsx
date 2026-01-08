"use client"

import Image from "next/image"
import { useState } from "react"

interface FooterLogoProps {
  logoUrl?: string | null
  alt?: string
}

export function FooterLogo({ 
  logoUrl, 
  alt = "ACS Logo" 
}: FooterLogoProps) {
  const defaultLogo = "/images/acs-logo.png"
  const [imgSrc, setImgSrc] = useState(logoUrl || defaultLogo)
  
  return (
    <div className="relative h-10 w-10 opacity-90 hover:opacity-100 transition-opacity duration-500">
      <Image 
        src={imgSrc} 
        alt={alt} 
        width={40}
        height={40}
        className="object-contain w-full h-full"
        onError={() => setImgSrc(defaultLogo)}
      />
    </div>
  )
}



