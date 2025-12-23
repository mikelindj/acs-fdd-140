import { z } from 'zod'

export const bookingSchema = z.object({
  type: z.enum(['TABLE', 'SEAT']),
  tableCapacity: z.number().optional(), // 10 or 11, only used when type is TABLE
  category: z.enum(['VIP', 'SCHOOL', 'OBA', 'GUEST']),
  quantity: z.number().min(1).max(11),
  buyerName: z.string().min(1, 'Name is required'),
  buyerEmail: z.string().email('Valid email is required'),
  buyerMobile: z.string().optional(),
  membershipNo: z.string().optional(),
  // NEW FIELDS
  gradYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 5).optional(), 
  capacity: z.number().optional(), 
  membershipValidated: z.boolean().optional(), // Whether membership was validated on frontend
  wantsBatchSeating: z.boolean().optional(),
  school: z.string().optional(),
  gradYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
}).refine((data) => {
  // If wantsBatchSeating is true, school and gradYear are required
  if (data.wantsBatchSeating) {
    return !!data.school?.trim() && !!data.gradYear
  }
  return true
}, {
  message: "School and Year of Completion are required when requesting batch seating",
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