export async function getBookingConfirmationEmail(buyerName: string, bookingDetails?: {
  type: string;
  quantity: number;
  cuisine?: string;
  cuisines?: string[];
}): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://140.acsoba.org"
  const logoUrl = `${baseUrl}/images/acs-140-logo.jpg`
  const footerLogoUrl = `${baseUrl}/images/acs-logo.png`
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Booking Confirmed - ${eventName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header with Logo and Wavy Pattern -->
          <tr>
            <td style="background-color: #f8fafc; background-image: url('${baseUrl}/images/wavy-pattern.jpg'); background-size: cover; background-position: center; background-repeat: repeat; border-bottom: 1px solid #e2e8f0; padding: 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 20px; border-radius: 16px;">
                    <img src="${logoUrl}" alt="ACS 140 Years" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1.2;">Hello ${buyerName},</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">Thank you for your booking! Your payment has been successfully processed.</p>

              ${bookingDetails ? `
              <!-- Booking Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 30px 0; background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Booking Summary</h3>

                    ${bookingDetails.type === 'TABLE' ? `
                    <p style="margin: 0 0 12px 0; font-size: 16px; color: #1e293b; font-weight: 500;">${bookingDetails.quantity} x Table${bookingDetails.quantity > 1 ? 's' : ''}</p>

                    ${bookingDetails.cuisines && bookingDetails.cuisines.length > 0 ? `
                    <div style="margin: 0 0 0 20px;">
                      ${(() => {
                        const cuisineCounts: { [key: string]: number } = {};
                        bookingDetails.cuisines.forEach(cuisine => {
                          cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
                        });
                        return Object.entries(cuisineCounts)
                          .map(([cuisine, count]) => `<p style="margin: 4px 0; font-size: 14px; color: #64748b;">${count} ${cuisine.toLowerCase()} cuisine</p>`)
                          .join('');
                      })()}
                    </div>
                    ` : ''}
                    ` : `
                    <p style="margin: 0 0 12px 0; font-size: 16px; color: #1e293b; font-weight: 500;">${bookingDetails.quantity} x Seat${bookingDetails.quantity > 1 ? 's' : ''}</p>

                    ${bookingDetails.cuisine ? `
                    <div style="margin: 0 0 0 20px;">
                      <p style="margin: 4px 0; font-size: 14px; color: #64748b;">${bookingDetails.cuisine.toLowerCase()} cuisine</p>
                    </div>
                    ` : ''}
                    `}
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">Table assignments will be arranged by our team based on the batch information you provided. You will receive further details closer to the event date.</p>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions, please contact our support team at admin@acsoba.org.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="${footerLogoUrl}" alt="ACS Logo" style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-right: 12px;" />
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; vertical-align: middle;">ACS OBA</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; border-top: 1px solid #334155;">
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">© 140th ACS OBA FOUNDERS DAY DINNER, 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function getInviteEmail(inviteCode: string, buyerName: string, guestName: string): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://140.acsoba.org"
  const logoUrl = `${baseUrl}/images/acs-140-logo.jpg`
  const footerLogoUrl = `${baseUrl}/images/acs-logo.png`
  
  const url = `${baseUrl}/invite?code=${inviteCode}`
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>You're Invited - ${eventName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header with Logo and Wavy Pattern -->
          <tr>
            <td style="background-color: #f8fafc; background-image: url('${baseUrl}/images/wavy-pattern.jpg'); background-size: cover; background-position: center; background-repeat: repeat; border-bottom: 1px solid #e2e8f0; padding: 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 20px; border-radius: 16px;">
                    <img src="${logoUrl}" alt="ACS 140 Years" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1.2;">Hello ${guestName},</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1e293b; line-height: 1.6;"><strong>${buyerName}</strong> has invited you to join them at ${eventName}!</p>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">Please complete your registration using the link below:</p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${url}" style="display: inline-block; background-color: #1e293b; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Complete Registration</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b; line-height: 1.6;">Or use this code: <strong style="color: #1e293b;">${inviteCode}</strong></p>
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6; word-break: break-all;">Or copy and paste this link: ${url}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="${footerLogoUrl}" alt="ACS Logo" style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-right: 12px;" />
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; vertical-align: middle;">ACS OBA</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; border-top: 1px solid #334155;">
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">© 140th ACS OBA FOUNDERS DAY DINNER, 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
    cuisine?: string | null
  }>
): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://140.acsoba.org"
  const logoUrl = `${baseUrl}/images/acs-140-logo.jpg`
  const footerLogoUrl = `${baseUrl}/images/acs-logo.png`

  // Format total amount
  const formatAmount = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return `S$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format cuisine breakdown
  const formatCuisineBreakdown = (cuisineJson: string | null | undefined) => {
    if (!cuisineJson) return ""

    try {
      const cuisines: string[] = JSON.parse(cuisineJson)
      if (!Array.isArray(cuisines) || cuisines.length === 0) return ""

      // Count occurrences of each cuisine
      const cuisineCounts: Record<string, number> = {}
      cuisines.forEach(cuisine => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
      })

      // Format as comma-separated list in parentheses with title case
      const breakdownParts = Object.entries(cuisineCounts).map(([cuisine, count]) => {
        // Convert to title case: "chinese-vegetarian" → "Chinese-Vegetarian"
        const titleCase = cuisine
          .toLowerCase()
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-')
        return `${count} ${titleCase} cuisine`
      })

      return `\n(${breakdownParts.join(', ')})`
    } catch {
      console.warn('Error parsing cuisine JSON in email template:', cuisineJson)
      return ""
    }
  }

  // Format item description
  const formatItem = (booking: typeof bookings[0]) => {
    const itemTypePlural = booking.type === "TABLE" ? "tables" : "seats"

    if (booking.type === "TABLE") {
      const baseDescription = `${booking.quantity} x ${itemTypePlural}`
      const cuisineBreakdown = formatCuisineBreakdown(booking.cuisine)
      return baseDescription + cuisineBreakdown
    } else {
      // For seats, handle cuisine
      const baseDescription = `${booking.quantity} x ${itemTypePlural}`
      if (booking.cuisine) {
        try {
          const cuisines: string[] = JSON.parse(booking.cuisine)
          if (Array.isArray(cuisines) && cuisines.length > 0) {
            const cuisineBreakdown = formatCuisineBreakdown(booking.cuisine)
            return baseDescription + cuisineBreakdown
          }
        } catch {
          // If JSON parsing fails, show as single cuisine in title case
          const titleCase = booking.cuisine
            .toLowerCase()
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('-')
          return `${baseDescription}\n(${titleCase} cuisine)`
        }
      }
      return baseDescription
    }
  }

  // Calculate total
  const totalAmount = bookings.reduce((sum, b) => {
    const amount = typeof b.totalAmount === "string" ? parseFloat(b.totalAmount) : b.totalAmount
    return sum + amount
  }, 0)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank You for Your Purchase - ${eventName}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header with Logo and Wavy Pattern -->
          <tr>
            <td style="background-color: #f8fafc; background-image: url('${baseUrl}/images/wavy-pattern.jpg'); background-size: cover; background-position: center; background-repeat: repeat; border-bottom: 1px solid #e2e8f0; padding: 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 20px; border-radius: 16px;">
                    <img src="${logoUrl}" alt="ACS 140 Years" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1.2;">Thank You for Your Purchase, ${buyerName}!</h1>
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">Your payment has been successfully processed. All purchases are final and non-refundable. Here are the details of your booking:</p>
              
              <!-- Order Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 0 0 30px 0; border: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1e293b;">Order Summary</h2>
                    ${bookings.map((booking) => `
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                        <tr>
                          <td style="padding: 0;">
                            <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1e293b;">${formatItem(booking)}</p>
                            <p style="margin: 0; font-size: 14px; color: #64748b;">Amount: ${formatAmount(booking.totalAmount)}</p>
                          </td>
                        </tr>
                      </table>
                    `).join("")}
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #1e293b;">
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">Total: ${formatAmount(totalAmount)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Additional Information -->
              <p style="margin: 0 0 30px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">
                ${bookings.some(b => b.type === "TABLE") 
                  ? `Table assignments will be arranged by our team based on the batch or group information you provided. You will receive your table allocation by 25 Feb 2026 via email.`
                  : `Your seat assignment will be arranged by our team. You will receive your table allocation by 25 Feb 2026 via email.`
                }
              </p>

              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions, please contact us at admin@acsoba.org.</p>
            </td>
          </tr>

          <!-- Promotional Section -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1e293b;">🎉 Celebrate the 140th Anniversary!</h3>
                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Mark this milestone with our exclusive <strong>140th Founders Day Polo Tee</strong> – featuring the official commemorative logo and timeless ACS heritage colors.
                    </p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">
                      <tr>
                        <td>
                          <a href="https://acsoba.org/product/140th-founders-day-polo-tee-commemorative-logo-and-classic-colours/"
                             style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center;">
                            Shop Now - Limited Edition!
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="${footerLogoUrl}" alt="ACS Logo" style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-right: 12px;" />
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; vertical-align: middle;">ACS OBA</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; border-top: 1px solid #334155;">
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">© 140th ACS OBA FOUNDERS DAY DINNER, 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Table assignment email: same design as getBookingConfirmationEmail.
 * Assigned table numbers are rendered very large so they cannot be missed.
 */
export async function getTableAssignmentEmail(
  buyerName: string,
  assignedTables: string[]
): Promise<string> {
  const { getEventSettings } = await import("@/lib/event-settings")
  const eventSettings = await getEventSettings()
  const eventName = eventSettings.eventName || "ACS Founders' Day Dinner"
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://140.acsoba.org"
  const logoUrl = `${baseUrl}/images/acs-140-logo.jpg`
  const footerLogoUrl = `${baseUrl}/images/acs-logo.png`

  const eventDateFormatted = eventSettings.eventDate
    ? new Date(eventSettings.eventDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const eventTime = eventSettings.eventTime?.trim() || ""
  const eventVenue = eventSettings.eventVenue || ""
  const eventDetails = [eventDateFormatted, eventTime, eventVenue].filter(Boolean).join(", ")

  // Very large table numbers so they cannot be missed
  const tableNumbersHtml = assignedTables
    .filter(Boolean)
    .map(
      (t) =>
        `<span style="display: inline-block; font-size: 48px; font-weight: 800; color: #1e293b; margin: 8px; padding: 12px 20px; background: #f1f5f9; border-radius: 12px; min-width: 72px; text-align: center;">${t}</span>`
    )
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Table Assignment - ${eventName}</title>
  <style type="text/css">
    @media (max-width: 600px) {
      .merchandise-items td {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box;
      }
      .merchandise-items td + td {
        padding-top: 24px !important;
      }
    }
  </style>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header with Logo and Wavy Pattern -->
          <tr>
            <td style="background-color: #f8fafc; background-image: url('${baseUrl}/images/wavy-pattern.jpg'); background-size: cover; background-position: center; background-repeat: repeat; border-bottom: 1px solid #e2e8f0; padding: 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 20px; border-radius: 16px;">
                    <img src="${logoUrl}" alt="ACS 140 Years" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #1e293b; line-height: 1.2;">Thank you, ${buyerName}, for your booking.</h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">We're looking forward to seeing you at our event:</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 0 0 32px 0; border: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e293b;">${eventName}</p>
                    ${eventDetails ? `<p style="margin: 8px 0 0 0; font-size: 16px; color: #475569;">${eventDetails}</p>` : ""}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1e293b; line-height: 1.6;">You have been assigned the following tables:</p>
              <!-- Large table numbers -->
              <div style="margin: 0 0 32px 0; text-align: center;">
                ${tableNumbersHtml || `<span style="font-size: 18px; color: #64748b;">No table numbers entered.</span>`}
              </div>

              <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions, please contact our support team at admin@acsoba.org.</p>

              <!-- Merchandise Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1e293b;">Have you gotten your ACS140 Limited Edition Merchandise?</h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="merchandise-items" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 12px; padding-bottom: 16px;">
                          <a href="https://acsoba.org/product/140th-founders-day-polo-tee-commemorative-logo-and-classic-colours/" style="text-decoration: none; color: inherit;">
                            <img src="https://acsoba.org/wp-content/uploads/2026/01/140polo-4.png" alt="ACS140 Polo Tee" style="max-width: 100%; width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid #e2e8f0;" />
                            <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">ACS140 Polo Tee (BACK IN STOCK)</p>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Shop now →</p>
                          </a>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 12px; padding-bottom: 16px;">
                          <a href="https://acsoba.org/product/acs140-decal/" style="text-decoration: none; color: inherit;">
                            <img src="https://acsoba.org/wp-content/uploads/2026/02/1.jpeg" alt="ACS140 Car Decal" style="max-width: 100%; width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid #e2e8f0;" />
                            <p style="margin: 12px 0 0 0; font-size: 16px; font-weight: 600; color: #1e293b;">ACS140 Car Decal (New)</p>
                            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Shop now →</p>
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="${footerLogoUrl}" alt="ACS Logo" style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-right: 12px;" />
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; vertical-align: middle;">ACS OBA</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; border-top: 1px solid #334155;">
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">© 140th ACS OBA FOUNDERS DAY DINNER, 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function getBroadcastEmail(subject: string, content: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://140.acsoba.org"
  const logoUrl = `${baseUrl}/images/acs-140-logo.jpg`
  const footerLogoUrl = `${baseUrl}/images/acs-logo.png`
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header with Logo and Wavy Pattern -->
          <tr>
            <td style="background-color: #f8fafc; background-image: url('${baseUrl}/images/wavy-pattern.jpg'); background-size: cover; background-position: center; background-repeat: repeat; border-bottom: 1px solid #e2e8f0; padding: 40px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 20px; border-radius: 16px;">
                    <img src="${logoUrl}" alt="ACS 140 Years" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1e293b; line-height: 1.2;">${subject}</h1>
              <div style="font-size: 16px; color: #1e293b; line-height: 1.6;">
                ${content}
              </div>
              <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">This is an automated message from the ACS Founders' Day Dinner team.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 40px 30px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="vertical-align: middle;">
                          <img src="${footerLogoUrl}" alt="ACS Logo" style="width: 40px; height: 40px; display: inline-block; vertical-align: middle; margin-right: 12px;" />
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; vertical-align: middle;">ACS OBA</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; border-top: 1px solid #334155;">
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">© 140th ACS OBA FOUNDERS DAY DINNER, 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

