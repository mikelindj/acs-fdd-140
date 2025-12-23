export const PRICING = {
  TABLE: {
    VIP: 1200,
    SCHOOL: 1000,
    OBA: 1000,
    GUEST: 1000,
  },
  SEAT: {
    VIP: 120,
    SCHOOL: 100,
    OBA: 100,
    GUEST: 100,
  },
} as const

export function calculateTotal(quantity: number, category: keyof typeof PRICING.TABLE, type: 'TABLE' | 'SEAT'): number {
  const basePrice = type === 'TABLE' ? PRICING.TABLE[category] : PRICING.SEAT[category]
  const subtotal = basePrice * quantity
  // No transaction fee charged to customers
  return Math.round(subtotal * 100) / 100
}

