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
              <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">If you have any questions, please contact our support team.</p>
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
  const formatCuisineBreakdown = (cuisineJson: string | null | undefined, quantity: number, type: string) => {
    if (!cuisineJson) return ""

    try {
      const cuisines: string[] = JSON.parse(cuisineJson)
      if (!Array.isArray(cuisines) || cuisines.length === 0) return ""

      // Count occurrences of each cuisine
      const cuisineCounts: Record<string, number> = {}
      cuisines.forEach(cuisine => {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
      })

      // Format the breakdown with indentation
      const breakdownLines = Object.entries(cuisineCounts).map(([cuisine, count]) => {
        return `   ${count} ${cuisine.toLowerCase()} cuisine`
      })

      return `\n${breakdownLines.join('\n')}`
    } catch {
      console.warn('Error parsing cuisine JSON in email template:', cuisineJson)
      return ""
    }
  }

  // Format item description
  const formatItem = (booking: typeof bookings[0]) => {
    const itemType = booking.type === "TABLE" ? "table" : "seat"
    const itemTypePlural = booking.type === "TABLE" ? "tables" : "seats"

    if (booking.type === "TABLE") {
      const baseDescription = `${booking.quantity} x ${itemTypePlural}`
      const cuisineBreakdown = formatCuisineBreakdown(booking.cuisine, booking.quantity, itemType)
      return baseDescription + cuisineBreakdown
    } else {
      // For seats, handle single cuisine
      const baseDescription = `${booking.quantity} x ${itemTypePlural}`
      if (booking.cuisine) {
        try {
          const cuisines: string[] = JSON.parse(booking.cuisine)
          if (Array.isArray(cuisines) && cuisines.length > 0) {
            const cuisineBreakdown = formatCuisineBreakdown(booking.cuisine, booking.quantity, itemType)
            return baseDescription + cuisineBreakdown
          }
        } catch {
          // If JSON parsing fails, show as single cuisine
          return `${baseDescription}\n   ${booking.cuisine.toLowerCase()} cuisine`
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
                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                              ${(() => {
                                if (!booking.cuisine) return 'Cuisines: Not specified';
                                try {
                                  const cuisines = JSON.parse(booking.cuisine);
                                  if (Array.isArray(cuisines) && cuisines.length > 0) {
                                    return 'Cuisines: ' + cuisines.map((c, i) => `${i + 1}. ${c}`).join(', ');
                                  }
                                  return 'Cuisines: Not specified';
                                } catch {
                                  return 'Cuisines: Not specified';
                                }
                              })()}
                            </p>
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

