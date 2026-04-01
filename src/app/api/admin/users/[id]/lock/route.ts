import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  const user = await db.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 })
  }

  const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.user.update({
    where: { id },
    data: {
      lockedUntil,
      failedLoginCount: Math.max(user.failedLoginCount, 5),
    },
  })

  await db.securityEvent.create({
    data: {
      userId: id,
      eventType: "ACCOUNT_LOCKED",
      severity: "MEDIUM",
      ipAddress: "0.0.0.0",
      metadata: {
        reason: "ADMIN_MANUAL_LOCK",
        adminId: session.user.id,
      },
    },
  })

  return NextResponse.json({ message: "Account locked" }, { status: 200 })
}
