import crypto from "crypto"

const HITPAY_API_KEY = process.env.HITPAY_API_KEY?.trim()
const HITPAY_SALT = process.env.HITPAY_SALT?.trim()
const HITPAY_ENV =
  process.env.HITPAY_ENV ??
  (process.env.NODE_ENV === "production" ? "production" : "sandbox")
const HITPAY_API_VERSION = process.env.HITPAY_API_VERSION ?? "v1"
const HITPAY_DEFAULT_PURPOSE =
  process.env.HITPAY_DEFAULT_PURPOSE ?? "ACS Founders Day Dinner Booking"
const HITPAY_BASE_URL_RAW =
  process.env.HITPAY_BASE_URL ??
  (HITPAY_ENV === "production"
    ? "https://api.hit-pay.com"
    : "https://api.sandbox.hit-pay.com")
const HITPAY_SANDBOX_BASE_URL_RAW =
  process.env.HITPAY_SANDBOX_BASE_URL ?? "https://api.sandbox.hit-pay.com"

const HITPAY_PAYMENT_METHODS = parsePaymentMethods(
  process.env.HITPAY_PAYMENT_METHODS
)
const HITPAY_ALLOW_REPEATED_PAYMENTS = parseBoolean(
  process.env.HITPAY_ALLOW_REPEATED_PAYMENTS,
  false
)
const HITPAY_BASE_URL = normalizeBaseUrl(HITPAY_BASE_URL_RAW)
const HITPAY_SANDBOX_BASE_URL = normalizeBaseUrl(HITPAY_SANDBOX_BASE_URL_RAW)

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback
  return ["true", "1", "yes"].includes(value.toLowerCase())
}

function parsePaymentMethods(value: string | undefined) {
  if (!value) return ["card", "paynow_online"]
  return value
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean)
}

function normalizeBaseUrl(base: string) {
  const trimmed = base.trim()
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, "")}`
  return withProtocol.replace(/\/+$/, "")
}

function fingerprint(secret?: string) {
  if (!secret) return "unset"
  if (secret.length <= 8) return "***"
  return `${secret.slice(0, 4)}…${secret.slice(-4)}`
}

function isLocalhostUrl(url?: string) {
  if (!url) return false
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url)
}

function ensureConfig() {
  if (!HITPAY_API_KEY) {
    throw new Error("HITPAY_API_KEY is not set")
  }
  if (!HITPAY_SALT) {
    throw new Error("HITPAY_SALT is not set")
  }
}

function buildBaseUrlFrom(base: string) {
  const trimmedBase = base.replace(/\/+$/, "")
  const trimmedVersion = HITPAY_API_VERSION.replace(/^\/+/, "")
  if (trimmedBase.endsWith(`/${trimmedVersion}`)) {
    return trimmedBase
  }
  return `${trimmedBase}/${trimmedVersion}`
}

export const hitPayConfig = {
  baseUrl: buildBaseUrlFrom(HITPAY_BASE_URL),
  paymentMethods: HITPAY_PAYMENT_METHODS,
  allowRepeatedPayments: HITPAY_ALLOW_REPEATED_PAYMENTS,
}

export interface HitPayPaymentRequestPayload {
  amount: number
  currency: string
  email?: string
  name?: string
  phone?: string
  purpose?: string
  redirect_url: string
  webhook: string
  reference_number: string
  payment_methods?: string[]
  allow_repeated_payments?: boolean
  generate_qr?: boolean
  send_email?: boolean
  send_sms?: boolean
}

export interface HitPayPaymentRequestResponse {
  id: string
  name?: string
  email?: string
  phone?: string
  amount: string
  currency: string
  status:
    | "pending"
    | "completed"
    | "failed"
    | "expired"
    | "canceled"
    | "inactive"
  purpose?: string
  reference_number?: string
  payment_methods?: string[]
  url: string
  redirect_url?: string
  webhook?: string
  send_sms?: boolean
  send_email?: boolean
  allow_repeated_payments?: boolean
  expiry_date?: string
  created_at?: string
  updated_at?: string
  staff_id?: string | null
  business_location_id?: string | null
  payment_request_id?: string
}

export interface CreateHitPayPaymentOptions {
  amount: number
  currency?: string
  email?: string
  name?: string
  phone?: string
  referenceNumber: string
  redirectUrl: string
  webhookUrl: string
  purpose?: string
  paymentMethods?: string[]
  allowRepeatedPayments?: boolean
  sendEmail?: boolean
  sendSms?: boolean
  generateQr?: boolean
}

export async function createHitPayPayment(
  options: CreateHitPayPaymentOptions
): Promise<HitPayPaymentRequestResponse> {
  ensureConfig()

  // Allow localhost override for development/testing with tunneling services
  const allowLocalhost = process.env.HITPAY_ALLOW_LOCALHOST === "true"
  if (!allowLocalhost && (isLocalhostUrl(options.redirectUrl) || isLocalhostUrl(options.webhookUrl))) {
    throw new Error(
      "HitPay requires public HTTPS URLs for redirect and webhook; please set HITPAY_RETURN_URL / HITPAY_WEBHOOK_URL to a public domain. For localhost testing, use a tunneling service or set HITPAY_ALLOW_LOCALHOST=true."
    )
  }

  const payload: HitPayPaymentRequestPayload = {
    amount: options.amount,
    currency: options.currency ?? "SGD",
    email: options.email,
    name: options.name,
    phone: options.phone,
    purpose: options.purpose ?? HITPAY_DEFAULT_PURPOSE,
    redirect_url: options.redirectUrl,
    webhook: options.webhookUrl,
    reference_number: options.referenceNumber,
    payment_methods: options.paymentMethods ?? HITPAY_PAYMENT_METHODS,
    allow_repeated_payments:
      options.allowRepeatedPayments ?? HITPAY_ALLOW_REPEATED_PAYMENTS,
    generate_qr: options.generateQr,
    send_email: options.sendEmail,
    send_sms: options.sendSms,
  }

  const initialBaseUrl = buildBaseUrlFrom(HITPAY_BASE_URL)
  const initialResult = await postPaymentRequest(initialBaseUrl, payload)

  if (initialResult.ok) {
    return initialResult.parsed
  }

  const isInvalidKey =
    initialResult.message.toLowerCase().includes("invalid business api key") ||
    initialResult.status === 404
  const alreadySandbox = initialBaseUrl.includes("sandbox.hit-pay.com")

  // Auto-fallback to sandbox if we appear to be using a sandbox key against prod
  if (isInvalidKey && !alreadySandbox) {
    const sandboxBaseUrl = buildBaseUrlFrom(HITPAY_SANDBOX_BASE_URL)
    const sandboxResult = await postPaymentRequest(sandboxBaseUrl, payload)
    if (sandboxResult.ok) {
      return sandboxResult.parsed
    }
    throw new Error(
      `HitPay API error: ${sandboxResult.status} ${sandboxResult.message}`
    )
  }

  // Auto-fallback to production if we appear to be using a production key against sandbox
  if (isInvalidKey && alreadySandbox) {
    const prodBaseUrl = buildBaseUrlFrom("https://api.hit-pay.com")
    const prodResult = await postPaymentRequest(prodBaseUrl, payload)
    if (prodResult.ok) {
      return prodResult.parsed
    }
    throw new Error(
      `HitPay API error: ${prodResult.status} ${prodResult.message}`
    )
  }

  throw new Error(
    `HitPay API error: ${initialResult.status} ${initialResult.message}`
  )
}

async function postPaymentRequest(
  baseUrl: string,
  payload: HitPayPaymentRequestPayload
): Promise<{
  ok: boolean
  status: number
  message: string
  parsed: HitPayPaymentRequestResponse
}> {
  const response = await fetch(`${baseUrl}/payment-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BUSINESS-API-KEY": HITPAY_API_KEY as string,
    },
    body: JSON.stringify(payload),
  })

  const rawBody = await response.text()
  let parsed: HitPayPaymentRequestResponse

  try {
    parsed = JSON.parse(rawBody)
  } catch {
    const result = {
      ok: response.ok,
      status: response.status,
      message: rawBody,
      parsed: {} as HitPayPaymentRequestResponse,
    }
    if (!result.ok) {
      console.error("HitPay request failed", {
        baseUrl,
        status: response.status,
        message: rawBody,
        key: fingerprint(HITPAY_API_KEY),
        env: HITPAY_ENV,
      })
    }
    return result
  }

  const message =
    (parsed as { error?: string }).error ??
    (parsed as { message?: string }).message ??
    rawBody

  const result = {
    ok: response.ok,
    status: response.status,
    message,
    parsed,
  }
  if (!result.ok) {
    console.error("HitPay request failed", {
      baseUrl,
      status: response.status,
      message,
      key: fingerprint(HITPAY_API_KEY),
      env: HITPAY_ENV,
    })
  }
  return result
}

export function parseHitPayWebhookPayload(
  body: string
): Record<string, unknown> {
  const trimmed = body.trim()
  if (!trimmed) return {}

  try {
    return JSON.parse(trimmed) as Record<string, unknown>
  } catch {
    // HitPay can send form-encoded webhooks
    return Object.fromEntries(new URLSearchParams(trimmed)) as Record<
      string,
      string
    >
  }
}

export function verifyHitPayWebhook(
  payload: Record<string, unknown>,
  signature?: string
): boolean {
  try {
    if (!HITPAY_SALT) {
      throw new Error("HITPAY_SALT is not set")
    }

    const payloadHmac =
      typeof (payload as { hmac?: unknown }).hmac === "string"
        ? (payload as { hmac: string }).hmac
        : undefined
    const providedSignature = signature || payloadHmac

    if (!providedSignature) {
      console.error("Webhook verification error: missing signature")
      return false
    }

    // Build canonical query-string in alphabetical order (HitPay requirement)
    const entries = Object.entries(payload).filter(
      ([key, value]) => key !== "hmac" && value !== undefined && value !== null
    )
    const sortedEntries = entries.sort(([a], [b]) => a.localeCompare(b))
    const params = new URLSearchParams()
    for (const [key, value] of sortedEntries) {
      params.append(key, String(value))
    }
    const payloadString = params.toString()
    const hash = crypto
      .createHmac("sha256", HITPAY_SALT)
      .update(payloadString)
      .digest("hex")
    return hash === providedSignature
  } catch (error) {
    console.error("Webhook verification error:", error)
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

