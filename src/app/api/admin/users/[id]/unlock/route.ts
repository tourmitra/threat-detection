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

  await db.user.update({
    where: { id },
    data: {
      lockedUntil: null,
      failedLoginCount: 0,
    },
  })

  await db.securityEvent.create({
    data: {
      userId: id,
      eventType: "ACCOUNT_UNLOCKED",
      severity: "INFO",
      ipAddress: "0.0.0.0",
      metadata: {
        reason: "ADMIN_MANUAL_UNLOCK",
        adminId: session.user.id,
      },
    },
  })

  return NextResponse.json({ message: "Account unlocked" }, { status: 200 })
}
