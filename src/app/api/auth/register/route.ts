import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, city, country, phone } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        city,
        country,
        phone,
      }
    })

    // Log the event
    await db.securityEvent.create({
      data: {
        userId: newUser.id,
        eventType: 'USER_REGISTERED',
        severity: 'INFO',
        ipAddress: req.headers.get('x-forwarded-for') || '0.0.0.0', // Vercel IP extraction
      }
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ message: error.issues?.[0]?.message || "Invalid request" }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
