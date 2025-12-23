import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Suppress Prisma connection error logs by intercepting stderr output
if (typeof process !== 'undefined' && process.stderr) {
  const originalStderrWrite = process.stderr.write.bind(process.stderr)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process.stderr.write = function (chunk: any, encoding?: any, callback?: any): boolean {
    const message = chunk?.toString() || ''
    // Suppress Prisma connection error messages
    if (
      message.includes('prisma:error') &&
      (message.includes("Can't reach database server") ||
       message.includes('Invalid `prisma.') ||
       message.includes('localhost:5432'))
    ) {
      // Don't log these errors - they're handled gracefully by our code
      return true
    }
    return originalStderrWrite(chunk, encoding, callback)
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Disable Prisma's internal logging to suppress connection error spam
  // Our application code handles errors gracefully with proper error handling
  log: [],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

