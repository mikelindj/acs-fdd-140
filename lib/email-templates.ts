export function getMagicLinkEmail(tableHash: string, buyerName: string): string {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/manage?table=${tableHash}`
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Your Table - ACS Founders' Day Dinner</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">ACS Founders' Day Dinner</h1>
    <p style="color: #fff; margin: 10px 0 0 0;">140 Years Celebration</p>
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1e3a8a;">Hello ${buyerName},</h2>
    <p>Thank you for your booking! You can now manage your table and invite your guests using the link below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="background-color: #1e3a8a; color: #fbbf24; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Manage Your Table</a>
    </div>
    <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #666; word-break: break-all;">${url}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="font-size: 12px; color: #666;">This link is unique to your booking. Please keep it secure.</p>
  </div>
</body>
</html>
  `
}

export function getInviteEmail(inviteCode: string, buyerName: string, guestName: string): string {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/invite?code=${inviteCode}`
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited - ACS Founders' Day Dinner</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #1e3a8a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #fbbf24; margin: 0;">ACS Founders' Day Dinner</h1>
    <p style="color: #fff; margin: 10px 0 0 0;">140 Years Celebration</p>
  </div>
  <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1e3a8a;">Hello ${guestName},</h2>
    <p><strong>${buyerName}</strong> has invited you to join them at the ACS Founders' Day Dinner!</p>
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

export function getBroadcastEmail(subject: string, content: string): string {
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
    <h1 style="color: #fbbf24; margin: 0;">ACS Founders' Day Dinner</h1>
    <p style="color: #fff; margin: 10px 0 0 0;">140 Years Celebration</p>
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

