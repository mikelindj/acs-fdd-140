import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create admin user
  const hashedPassword = await bcrypt.hash("TGBTG-TBIYTB", 10)
  const admin = await prisma.admin.upsert({
    where: { email: "admin@acsoba.org" },
    update: {},
    create: {
      email: "admin@acsoba.org",
      name: "Admin User",
      passwordHash: hashedPassword,
    },
  })
  console.log("Created admin:", admin.email)

  // Create sample tables
  const tables = []
  for (let i = 1; i <= 20; i++) {
    const table = await prisma.table.upsert({
      where: { tableNumber: `T${i.toString().padStart(2, "0")}` },
      update: {},
      create: {
        tableNumber: `T${i.toString().padStart(2, "0")}`,
        capacity: 11,
        status: "AVAILABLE",
        tableHash: `table${i.toString().padStart(10, "0")}`,
      },
    })
    tables.push(table)
  }
  console.log(`Created/updated ${tables.length} tables`)

  // Create sample buyer
  const buyer = await prisma.guest.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      mobile: "+65 9123 4567",
      membershipNo: "M12345",
    },
  })

  // Create sample booking (only if it doesn't exist)
  let booking = await prisma.booking.findFirst({
    where: { buyerId: buyer.id, type: "TABLE" },
  })

  if (!booking) {
    booking = await prisma.booking.create({
      data: {
        type: "TABLE",
        category: "OBA",
        quantity: 1,
        totalAmount: 1034.0,
        transactionFee: 34.0,
        balanceDue: 1034.0,
        status: "PAID",
        buyerId: buyer.id,
      },
    })
  }

  // Assign table to booking
  await prisma.table.update({
    where: { id: tables[0].id },
    data: {
      bookingId: booking.id,
      status: "RESERVED",
    },
  })

  // Create sample guests
  const guests = []
  for (let i = 1; i <= 5; i++) {
    const guest = await prisma.guest.upsert({
      where: { email: `guest${i}@example.com` },
      update: {},
      create: {
        name: `Guest ${i}`,
        email: `guest${i}@example.com`,
        mobile: `+65 9123 ${4567 + i}`,
        school: "ACS(I)",
        gradYear: 2010 + i,
      },
    })
    guests.push(guest)
  }

  // Add guests to booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      guests: {
        connect: guests.map((g) => ({ id: g.id })),
      },
    },
  })

  // Assign some guests to table
  await prisma.guest.updateMany({
    where: { id: { in: guests.slice(0, 3).map((g) => g.id) } },
    data: { tableId: tables[0].id },
  })

  // Create invite codes
  for (let i = 0; i < 5; i++) {
    await prisma.inviteCode.upsert({
      where: { code: `INV${i.toString().padStart(5, "0")}` },
      update: {},
      create: {
        code: `INV${i.toString().padStart(5, "0")}`,
        bookingId: booking.id,
        email: buyer.email!,
      },
    })
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

