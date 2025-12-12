import crypto from 'crypto'

const HITPAY_API_KEY = process.env.HITPAY_API_KEY!
const HITPAY_SALT = process.env.HITPAY_SALT!
const HITPAY_BASE_URL = 'https://api.hit-pay.com/v1'

export interface HitPayPaymentRequest {
  amount: number
  currency: string
  email: string
  name: string
  purpose: string
  redirect_url: string
  webhook: string
  reference_number: string
}

export interface HitPayPaymentResponse {
  id: string
  payment_request_id: string
  payment_type: string
  amount: number
  currency: string
  status: string
  redirect_url: string
}

export async function createHitPayPayment(data: {
  amount: number
  email: string
  name: string
  referenceNumber: string
  redirectUrl: string
  webhookUrl: string
}): Promise<HitPayPaymentResponse> {
  const payload: HitPayPaymentRequest = {
    amount: data.amount,
    currency: 'SGD',
    email: data.email,
    name: data.name,
    purpose: 'ACS Founders Day Dinner Booking',
    redirect_url: data.redirectUrl,
    webhook: data.webhookUrl,
    reference_number: data.referenceNumber,
  }

  const response = await fetch(`${HITPAY_BASE_URL}/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-BUSINESS-API-KEY': HITPAY_API_KEY,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HitPay API error: ${error}`)
  }

  return response.json()
}

export function verifyHitPayWebhook(
  payload: string,
  signature: string
): boolean {
  try {
    const data = JSON.parse(payload)
    const hmac = data.hmac || signature
    
    // Remove hmac from payload for verification
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hmac: _, ...dataWithoutHmac } = data
    const payloadString = JSON.stringify(dataWithoutHmac)
    
    const hash = crypto
      .createHmac('sha256', HITPAY_SALT)
      .update(payloadString)
      .digest('hex')
    return hash === hmac
  } catch (error) {
    console.error('Webhook verification error:', error)
    return false
  }
}

export interface HitPayWebhookPayload {
  payment_id: string
  payment_request_id: string
  payment_type: string
  amount: number
  currency: string
  status: string
  reference_number: string
  hmac: string
}

