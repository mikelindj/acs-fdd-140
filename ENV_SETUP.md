# Environment Variables for Redirect URLs

## Overview
The payment redirect URL is constructed using environment variables to support both localhost testing and production deployment.

## Environment Variables

### Required for Production
- `NEXT_PUBLIC_SITE_URL` - The public base URL of your application (e.g., `https://140.acsoba.org`)
- `HITPAY_RETURN_URL` (optional) - Override for redirect URL (defaults to `NEXT_PUBLIC_SITE_URL`)
- `HITPAY_WEBHOOK_URL` (optional) - Override for webhook URL (defaults to `HITPAY_RETURN_URL` or `NEXT_PUBLIC_SITE_URL`)

### For Localhost Testing
- `HITPAY_ALLOW_LOCALHOST=true` - Allows localhost URLs (requires tunneling service like ngrok)
- `HITPAY_RETURN_URL` - Set to your tunneling service URL (e.g., `https://your-ngrok-url.ngrok.io`)

## Configuration Examples

### Production (.env.production)
```env
NEXT_PUBLIC_SITE_URL=https://140.acsoba.org
HITPAY_RETURN_URL=https://140.acsoba.org
HITPAY_WEBHOOK_URL=https://140.acsoba.org
```

### Localhost Development (.env.local)
```env
# Option 1: Use tunneling service (recommended)
NEXT_PUBLIC_SITE_URL=https://your-ngrok-url.ngrok.io
HITPAY_RETURN_URL=https://your-ngrok-url.ngrok.io
HITPAY_WEBHOOK_URL=https://your-ngrok-url.ngrok.io

# Option 2: Allow localhost (for testing only)
HITPAY_ALLOW_LOCALHOST=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
HITPAY_RETURN_URL=http://localhost:3000
HITPAY_WEBHOOK_URL=http://localhost:3000
```

## How It Works

1. The redirect URL is constructed as: `${HITPAY_RETURN_URL || NEXT_PUBLIC_SITE_URL}/redirect?reference=${bookingId}`
2. HitPay will append its own query parameters (e.g., `&reference=payment-id&status=completed`)
3. The `/redirect` page handles all query parameters and extracts the booking reference
4. The page then redirects to `/manage?table=...&paymentStatus=...`

## Notes

- HitPay requires public HTTPS URLs for production
- For localhost testing, use a tunneling service (ngrok, Cloudflare Tunnel, etc.) or set `HITPAY_ALLOW_LOCALHOST=true`
- The redirect URL will have the format: `https://your-domain.com/redirect?reference=booking-id&reference=payment-id&status=completed`
- The redirect page handles duplicate parameters by picking the first valid booking reference


