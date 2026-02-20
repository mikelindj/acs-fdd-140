import nodemailer from 'nodemailer'

export type InlineAttachment = {
  filename: string
  content: Buffer
  cid: string
}

/** Fetch image from URL; returns Buffer or null on failure. */
async function fetchImageAsBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "ACS-FDD-Email/1.0" } })
    if (!res.ok) return null
    const ab = await res.arrayBuffer()
    return Buffer.from(ab)
  } catch {
    return null
  }
}

/**
 * Replace image URLs in HTML with cid: references and prepare inline attachments.
 * Fetches each URL; on success adds to attachments and replaces URL in html with cid:cid.
 * On fetch failure the URL is left unchanged (image may still load from origin in some clients).
 */
export async function prepareInlineImages(
  html: string,
  urlToCid: { url: string; cid: string; filename: string }[]
): Promise<{ html: string; attachments: InlineAttachment[] }> {
  let outHtml = html
  const attachments: InlineAttachment[] = []

  for (const { url, cid, filename } of urlToCid) {
    const buf = await fetchImageAsBuffer(url)
    if (!buf) {
      console.warn("Inline image fetch failed, keeping URL in email:", url)
      continue
    }
    attachments.push({ filename, content: buf, cid })
    // Replace both plain src="url" and url('url') in styles
    outHtml = outHtml.split(url).join(`cid:${cid}`)
  }

  return { html: outHtml, attachments }
}

// Validate required environment variables
if (!process.env.GMAIL_USER) {
  throw new Error('GMAIL_USER environment variable is required')
}
if (!process.env.GMAIL_APP_PASSWORD) {
  throw new Error('GMAIL_APP_PASSWORD environment variable is required')
}

// Create reusable transporter using Gmail SMTP (matching PHP PHPMailer configuration)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL for port 465
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
})

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP configuration error:', error)
  } else {
    console.log('SMTP server is ready to send emails')
  }
})

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string
  subject: string
  html: string
  attachments?: InlineAttachment[]
}) {
  try {
    const fromEmail = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_USER
    if (!fromEmail) {
      throw new Error('GMAIL_FROM_EMAIL or GMAIL_USER must be set')
    }

    const nodemailerAttachments = attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      cid: a.cid,
    }))

    const info = await transporter.sendMail({
      from: {
        name: 'The ACSOBA',
        address: fromEmail,
      },
      to,
      subject,
      html,
      encoding: 'UTF-8',
      attachments: nodemailerAttachments.length ? nodemailerAttachments : undefined,
    })

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
    })

    return { success: true, id: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

