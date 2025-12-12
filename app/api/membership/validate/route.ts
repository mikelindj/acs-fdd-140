import { NextRequest, NextResponse } from "next/server"
import { validateMembershipNumber } from "@/lib/membership"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const membershipNo = searchParams.get("membershipNo")

  if (!membershipNo) {
    return NextResponse.json({ error: "membershipNo is required" }, { status: 400 })
  }

  try {
    const isValid = await validateMembershipNumber(membershipNo)
    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("Membership validation error:", error)
    return NextResponse.json({ error: "Validation failed" }, { status: 500 })
  }
}

