import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "logo", "footerLogo", or "siteIcon"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type || (type !== "logo" && type !== "footerLogo" && type !== "siteIcon")) {
      return NextResponse.json({ error: "Invalid type. Must be 'logo', 'footerLogo', or 'siteIcon'" }, { status: 400 })
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate filename
    const fileExtension = file.name.split(".").pop() || "png"
    const timestamp = Date.now()
    const filename = type === "logo" 
      ? `event-logo-${timestamp}.${fileExtension}`
      : type === "footerLogo"
      ? `event-footer-logo-${timestamp}.${fileExtension}`
      : `event-icon-${timestamp}.${fileExtension}`
    
    // Save to public/images directory
    const imagesDir = join(process.cwd(), "public", "images")
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    const filepath = join(imagesDir, filename)
    await writeFile(filepath, buffer)

    // Save URL to database
    const imageUrl = `/images/${filename}`
    const updateData = type === "logo" 
      ? { logoImageUrl: imageUrl }
      : type === "footerLogo"
      ? { footerLogoImageUrl: imageUrl }
      : { siteIconUrl: imageUrl }
    
    await prisma.eventSettings.upsert({
      where: { id: "event" },
      update: updateData,
      create: {
        id: "event",
        ...updateData,
      },
    })

    return NextResponse.json({ success: true, url: imageUrl })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

