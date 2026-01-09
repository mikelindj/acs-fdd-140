import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { PrismaClientInitializationError } from "@prisma/client/runtime/library"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // TEMPORARY: Fallback admin credentials for when database is not available
        const TEMP_ADMIN_EMAIL = "admin@acsoba.org"
        const TEMP_ADMIN_PASSWORD = "TGBTG-TBIYTB"

        if (credentials.email === TEMP_ADMIN_EMAIL && credentials.password === TEMP_ADMIN_PASSWORD) {
          return {
            id: "temp-admin",
            email: TEMP_ADMIN_EMAIL,
            name: "ACS OBA Administrator",
          }
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: credentials.email }
          })

          if (!admin) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash)

          if (!isValid) {
            return null
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
          }
        } catch (error) {
          // Only log non-connection errors to avoid spam when DB is unavailable
          if (!(error instanceof PrismaClientInitializationError)) {
            console.error("Auth error:", error)
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

