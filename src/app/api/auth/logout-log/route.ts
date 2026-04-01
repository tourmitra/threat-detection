import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No active session" }, { status: 200 })
    }

    await db.securityEvent.create({
      data: {
        userId: session.user.id,
        eventType: "LOGOUT",
        severity: "INFO",
        ipAddress: "0.0.0.0",
        metadata: {
          source: "NAV_SIGN_OUT",
        },
      },
    })

    return NextResponse.json({ message: "Logout event logged" }, { status: 201 })
  } catch {
    // Avoid blocking sign-out flow on logging failures.
    return NextResponse.json({ message: "Log write skipped" }, { status: 200 })
  }
}
