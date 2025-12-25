import { NextRequest, NextResponse } from "next/server"
import { validateMembershipNumber } from "@/lib/membership"

// Maximum request body size (1KB should be more than enough for a membership number)
const MAX_BODY_SIZE = 1024

// Helper to validate and extract membership number from request body
async function getMembershipNumberFromBody(request: NextRequest): Promise<string | null> {
  try {
    // Check content length before parsing
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return null
    }

    const body = await request.json()
    
    // Validate that membershipNo exists and is a string
    if (!body || typeof body !== 'object') {
      return null
    }
    
    const { membershipNo } = body
    
    if (!membershipNo || typeof membershipNo !== 'string') {
      return null
    }
    
    return membershipNo
  } catch (error) {
    // Invalid JSON or other parsing errors
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const membershipNo = searchParams.get("membershipNo")

    if (!membershipNo) {
      return NextResponse.json(
        { error: "membershipNo is required" },
        { status: 400 }
      )
    }

    // Validate membership number format before processing
    if (typeof membershipNo !== 'string' || membershipNo.length > 50) {
      return NextResponse.json(
        { error: "Invalid membership number format" },
        { status: 400 }
      )
    }

    const isValid = await validateMembershipNumber(membershipNo)
    
    // Return consistent response format
    return NextResponse.json(
      { valid: isValid },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (error) {
    // Log error server-side but don't expose details to client
    console.error("Membership validation API error:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract membership number from request body
    const membershipNo = await getMembershipNumberFromBody(request)

    if (!membershipNo) {
      return NextResponse.json(
        { error: "Invalid request. membershipNo is required and must be a valid string." },
        { status: 400 }
      )
    }

    // Additional validation: check length
    if (membershipNo.length > 50) {
      return NextResponse.json(
        { error: "Invalid membership number format" },
        { status: 400 }
      )
    }

    const isValid = await validateMembershipNumber(membershipNo)
    
    // Return consistent response format
    return NextResponse.json(
      { valid: isValid },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (error) {
    // Log error server-side but don't expose details to client
    console.error("Membership validation API error:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    })
    
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    )
  }
}

