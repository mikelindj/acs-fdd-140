import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  logoUrl?: string | null
  alt?: string
  className?: string
  priority?: boolean
  linkToHome?: boolean
}

export function Logo({ 
  logoUrl, 
  alt = "Event Logo", 
  className = "relative h-24 md:h-32 w-auto transition-transform hover:scale-105 duration-300",
  priority = false,
  linkToHome = true
}: LogoProps) {
  const defaultLogo = "/images/acs-140-logo.jpg"
  const imageSrc = logoUrl || defaultLogo
  
  const logoImage = (
    <div className={className}>
      <Image 
        src={imageSrc} 
        alt={alt} 
        width={200}
        height={128}
        className="object-contain w-full h-full"
        priority={priority}
      />
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}



