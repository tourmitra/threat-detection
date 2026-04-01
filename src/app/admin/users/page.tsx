import { auth } from "@/auth"
import { db } from "@/lib/db"
import AdminUserTable from "@/components/admin-user-table"

export default async function AdminUsersPage() {
  const session = await auth()

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">Access Denied: Administrators only.</div>
      </div>
    )
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      failedLoginCount: true,
      lockedUntil: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })

  const serializedUsers = users.map((u) => ({
    ...u,
    lockedUntil: u.lockedUntil ? u.lockedUntil.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }))

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold">User Account Management</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Lock or unlock user accounts. Admin accounts are protected from accidental lock.
        </p>
      </div>

      <AdminUserTable users={serializedUsers} />
    </div>
  )
}
