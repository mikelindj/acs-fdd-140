import { NextRequest, NextResponse } from "next/server"
import { calculateTotal } from "@/lib/pricing"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quantity, category, type } = body

    if (!quantity || !category || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const total = calculateTotal(
      parseInt(quantity),
      category,
      type
    )

    return NextResponse.json({ total })
  } catch (error) {
    console.error("Error calculating pricing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
