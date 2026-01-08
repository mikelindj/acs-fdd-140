import { z } from 'zod'

export const bookingSchema = z.object({
  type: z.enum(['TABLE', 'SEAT']),
  tableCapacity: z.number().optional(), // 10 or 11, only used when type is TABLE
  category: z.enum(['VIP', 'SCHOOL', 'OBA', 'GUEST']),
  quantity: z.number().min(1),
  buyerName: z.string().min(1, 'Name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerMobile: z.string().optional(),
  membershipNo: z.string().optional(),
  membershipValidated: z.boolean().optional(), // Whether membership was validated on frontend
  voucherCode: z.string().optional(), // Voucher code to apply discount
  wantsBatchSeating: z.boolean().optional(),
  school: z.string().optional(),
  gradYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  cuisine: z.string().optional(), // JSON array of cuisine selections
  tableDiscountApplied: z.boolean().optional(), // Whether table bundle discount was manually applied
}).refine((data) => {
  // Batch seating validation based on what fields are provided
  if (data.wantsBatchSeating) {
    // If gradYear is provided, it means SCHOOL_YEAR batch type was selected
    if (data.gradYear !== undefined && data.gradYear !== null) {
      return !!data.school?.trim() && !!data.gradYear
    } else {
      // If gradYear is not provided, it means PSG or SCHOOL_STAFF batch type was selected
      return !!data.school?.trim()
    }
  }
  return true
}, {
  message: "Please complete all required batch information",
  path: ["school"], // This will show the error on the school field
})

export const guestRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  mobile: z.string().optional(),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  school: z.string().optional(),
  gradYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  dietary: z.string().optional(),
  inviteCode: z.string().length(8, 'Invite code must be 8 characters'),
})

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const tableAssignmentSchema = z.object({
  tableId: z.string(),
  guestIds: z.array(z.string()),
})

export const broadcastSchema = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
  recipients: z.enum(['all', 'buyers', 'guests', 'unseated']),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type GuestRegistrationInput = z.infer<typeof guestRegistrationSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type TableAssignmentInput = z.infer<typeof tableAssignmentSchema>
export type BroadcastInput = z.infer<typeof broadcastSchema>

