import nodemailer from 'nodemailer'

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
  type = 'transactional',
}: {
  to: string
  subject: string
  html: string
  type?: string
}) {
  try {
    const info = await transporter.sendMail({
      from: {
        name: 'The ACSOBA',
        address: process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_USER,
      },
      to,
      subject,
      html,
      encoding: 'UTF-8',
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

