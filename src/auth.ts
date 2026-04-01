import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

async function safeCreateSecurityEvent(data: {
  userId?: string
  eventType: string
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ipAddress: string
  metadata?: Record<string, unknown>
}) {
  try {
    const payload: Prisma.SecurityEventUncheckedCreateInput = {
      eventType: data.eventType,
      severity: data.severity,
      ipAddress: data.ipAddress,
      metadata: data.metadata as Prisma.InputJsonValue | undefined,
      ...(data.userId ? { userId: data.userId } : {}),
    }

    await db.securityEvent.create({
      data: payload,
    })
  } catch {
    // Logging must never break authentication flow.
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = loginSchema.safeParse(credentials)

          if (!parsedCredentials.success) {
            await safeCreateSecurityEvent({
              eventType: 'LOGIN_FAILED',
              severity: 'LOW',
              ipAddress: '0.0.0.0',
              metadata: {
                reason: 'INVALID_LOGIN_INPUT',
              },
            })
            return null
          }

          const { email, password } = parsedCredentials.data

          const user = await db.user.findUnique({
            where: { email }
          })

          if (!user) {
            await safeCreateSecurityEvent({
              eventType: 'LOGIN_FAILED',
              severity: 'LOW',
              ipAddress: '0.0.0.0',
              metadata: {
                email,
                reason: 'EMAIL_NOT_FOUND',
              },
            })
            return null
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            await safeCreateSecurityEvent({
              userId: user.id,
              eventType: 'ACCOUNT_LOCKED',
              severity: 'MEDIUM',
              ipAddress: '0.0.0.0',
              metadata: {
                email,
                reason: 'LOCKED_ACCOUNT_LOGIN_ATTEMPT',
              },
            })
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

          if (!passwordsMatch) {
            // Increment failed login count
            const newCount = user.failedLoginCount + 1
            const lockedUntil = newCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
            
            await db.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: newCount,
                lockedUntil
              }
            })

            // Log security event
            await safeCreateSecurityEvent({
              userId: user.id,
              eventType: lockedUntil ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
              severity: lockedUntil ? 'MEDIUM' : 'LOW',
              ipAddress: '0.0.0.0',
              metadata: {
                email,
                reason: 'WRONG_PASSWORD',
              },
            })

            return null
          }

          // Reset failed login count
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          })

          // Log successful login
          await safeCreateSecurityEvent({
            userId: user.id,
            eventType: 'LOGIN_SUCCESS',
            severity: 'INFO',
            ipAddress: '0.0.0.0',
            metadata: {
              email,
            },
          })

          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role,
            city: user.city,
          }
        } catch (error) {
          console.error("Credentials authorize error", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.city = user.city
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token && session.user) {
        session.user.role = token.role as "ADMIN" | "USER"
        session.user.id = token.id as string
        session.user.city = token.city as string | undefined
      }
      return session
    }
  }
})