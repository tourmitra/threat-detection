import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
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
            await db.securityEvent.create({
              data: {
                eventType: 'LOGIN_FAILED',
                severity: 'LOW',
                ipAddress: '0.0.0.0',
                metadata: {
                  reason: 'INVALID_LOGIN_INPUT',
                },
              }
            })
            return null
          }

          const { email, password } = parsedCredentials.data

          const user = await db.user.findUnique({
            where: { email }
          })

          if (!user) {
            await db.securityEvent.create({
              data: {
                eventType: 'LOGIN_FAILED',
                severity: 'LOW',
                ipAddress: '0.0.0.0',
                metadata: {
                  email,
                  reason: 'EMAIL_NOT_FOUND',
                },
              }
            })
            return null
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            await db.securityEvent.create({
              data: {
                userId: user.id,
                eventType: 'ACCOUNT_LOCKED',
                severity: 'MEDIUM',
                ipAddress: '0.0.0.0',
                metadata: {
                  email,
                  reason: 'LOCKED_ACCOUNT_LOGIN_ATTEMPT',
                },
              }
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
            await db.securityEvent.create({
              data: {
                userId: user.id,
                eventType: lockedUntil ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
                severity: lockedUntil ? 'MEDIUM' : 'LOW',
                ipAddress: '0.0.0.0', // Will be extracted from request in middleware later
                metadata: {
                  email,
                  reason: 'WRONG_PASSWORD',
                },
              }
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
          await db.securityEvent.create({
            data: {
              userId: user.id,
              eventType: 'LOGIN_SUCCESS',
              severity: 'INFO',
              ipAddress: '0.0.0.0', // Update later
              metadata: {
                email,
              },
            }
          })

          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role,
            city: user.city,
          }
        } catch (error) {
          throw error
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