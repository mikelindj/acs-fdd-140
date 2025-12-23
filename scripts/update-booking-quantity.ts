import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function updateBookingQuantity(tableHash: string, newQuantity: number) {
  try {
    // Find the table by hash
    const table = await prisma.table.findUnique({
      where: { tableHash },
      include: { booking: true },
    })

    if (!table) {
      console.error(`Table with hash ${tableHash} not found`)
      process.exit(1)
    }

    if (!table.booking) {
      console.error(`No booking found for table ${tableHash}`)
      process.exit(1)
    }

    console.log(`Found booking: ${table.booking.id}`)
    console.log(`Current quantity: ${table.booking.quantity}`)

    // Update the booking quantity
    const updated = await prisma.booking.update({
      where: { id: table.booking.id },
      data: { quantity: newQuantity },
    })

    console.log(`✅ Updated booking ${updated.id} quantity to ${updated.quantity}`)
  } catch (error) {
    console.error("Error updating booking:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get arguments from command line
const tableHash = process.argv[2]
const newQuantity = parseInt(process.argv[3], 10)

if (!tableHash || !newQuantity || isNaN(newQuantity)) {
  console.log("Usage: npx tsx scripts/update-booking-quantity.ts <tableHash> <newQuantity>")
  console.log("Example: npx tsx scripts/update-booking-quantity.ts table0000000001 3")
  process.exit(1)
}

updateBookingQuantity(tableHash, newQuantity)

