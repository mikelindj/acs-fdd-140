import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@acs.edu.sg',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    // Log email (you can save to database)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

