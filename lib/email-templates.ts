export async function getBookingConfirmationEmail(buyerName: string): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const eventDate = eventSettings.eventDate ? new Date(eventSettings.eventDate).toLocaleDateString() : null
  const eventVenue = eventSettings.eventVenue || null
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed - ${eventName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">${eventName}</h1>
    ${eventDate || eventVenue ? `<p style="color: #fff; margin: 10px 0 0 0;">${eventDate ? eventDate : ""}${eventDate && eventVenue ? " • " : ""}${eventVenue ? eventVenue : ""}</p>` : ""}
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1e3a8a;">Hello ${buyerName},</h2>
    <p>Thank you for your booking! Your payment has been successfully processed.</p>
    <p>Table assignments will be arranged by our team based on the batch information you provided. You will receive further details closer to the event date.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
  </div>
</body>
</html>
  `
}

export async function getInviteEmail(inviteCode: string, buyerName: string, guestName: string): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const eventDate = eventSettings.eventDate ? new Date(eventSettings.eventDate).toLocaleDateString() : null
  const eventVenue = eventSettings.eventVenue || null
  
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/invite?code=${inviteCode}`
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited - ${eventName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">${eventName}</h1>
    ${eventDate || eventVenue ? `<p style="color: #fff; margin: 10px 0 0 0;">${eventDate ? eventDate : ""}${eventDate && eventVenue ? " • " : ""}${eventVenue ? eventVenue : ""}</p>` : ""}
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1e3a8a;">Hello ${guestName},</h2>
    <p><strong>${buyerName}</strong> has invited you to join them at ${eventName}!</p>
    <p>Please complete your registration using the link below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="background-color: #1e3a8a; color: #fbbf24; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Complete Registration</a>
    </div>
    <p style="font-size: 12px; color: #666;">Or use this code: <strong>${inviteCode}</strong></p>
    <p style="font-size: 12px; color: #666; word-break: break-all;">Or copy and paste this link: ${url}</p>
  </div>
</body>
</html>
  `
}

export async function getPurchaseConfirmationEmail(
  buyerName: string,
  bookings: Array<{
    id: string
    type: string
    quantity: number
    totalAmount: number | string
    tableHash?: string | null
    tableNumber?: string | null
    tableCapacity?: number | null
  }>
): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const eventDate = eventSettings.eventDate ? new Date(eventSettings.eventDate).toLocaleDateString() : null
  const eventVenue = eventSettings.eventVenue || null
  // const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "" // Reserved for future table links functionality

  // Format total amount
  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return `S$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format item description
  const formatItem = (booking: typeof bookings[0]) => {
    if (booking.type === "TABLE") {
      const capacity = booking.tableCapacity || 10
      return `${booking.quantity} ${booking.quantity === 1 ? "Table" : "Tables"} (${capacity}-seater)`
    } else {
      return `${booking.quantity} ${booking.quantity === 1 ? "Seat" : "Seats"}`
    }
  }

  // Calculate total
  const totalAmount = bookings.reduce((sum, b) => {
    const amount = typeof b.totalAmount === "string" ? parseFloat(b.totalAmount) : b.totalAmount
    return sum + amount
  }, 0)

  // Generate table links (reserved for future functionality)
  // const tableLinks = bookings
  //   .filter((b) => b.tableHash)
  //   .map((b) => ({
  //     hash: b.tableHash!,
  //     number: b.tableNumber || "Not assigned",
  //     capacity: b.tableCapacity || 10,
  //     url: `${baseUrl}/manage?table=${b.tableHash}`,
  //   }))

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Purchase - ${eventName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">${eventName}</h1>
    ${eventDate || eventVenue ? `<p style="color: #fff; margin: 10px 0 0 0;">${eventDate ? eventDate : ""}${eventDate && eventVenue ? " • " : ""}${eventVenue ? eventVenue : ""}</p>` : ""}
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1e3a8a;">Thank You for Your Purchase, ${buyerName}!</h2>
    <p>Your payment has been successfully processed. Here are the details of your booking:</p>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #1e3a8a; margin-top: 0;">Order Summary</h3>
      ${bookings.map((booking) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 5px 0; font-weight: bold;">${formatItem(booking)}</p>
          <p style="margin: 5px 0; color: #666;">Amount: ${formatAmount(booking.totalAmount)}</p>
        </div>
      `).join("")}
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #1e3a8a;">
        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e3a8a;">Total: ${formatAmount(totalAmount)}</p>
      </div>
    </div>

    ${bookings.some(b => b.type === "TABLE") 
      ? `<p>Table assignments will be arranged by our team based on the batch information you provided. You will receive further details closer to the event date.</p>`
      : `<p>Your seat assignment will be arranged by our team. You will receive further details closer to the event date.</p>`
    }

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666;">If you have any questions, please contact our support team.</p>
    <p style="font-size: 12px; color: #666;">Thank you for being part of ${eventName}!</p>
  </div>
</body>
</html>
  `
}

export async function getBroadcastEmail(subject: string, content: string): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const eventDate = eventSettings.eventDate ? new Date(eventSettings.eventDate).toLocaleDateString() : null
  const eventVenue = eventSettings.eventVenue || null
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">${eventName}</h1>
    ${eventDate || eventVenue ? `<p style="color: #fff; margin: 10px 0 0 0;">${eventDate ? eventDate : ""}${eventDate && eventVenue ? " • " : ""}${eventVenue ? eventVenue : ""}</p>` : ""}
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <div style="color: #1e3a8a;">
      ${content}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666;">This is an automated message from the ACS Founders' Day Dinner team.</p>
  </div>
</body>
</html>
  `
}

