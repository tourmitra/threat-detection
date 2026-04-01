"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type AdminUser = {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
  failedLoginCount: number
  lockedUntil: string | null
  createdAt: string
  lastLoginAt: string | null
}

export default function AdminUserTable({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  const now = new Date()

  const toggleLock = async (user: AdminUser) => {
    setBusyUserId(user.id)
    const isLocked = !!(user.lockedUntil && new Date(user.lockedUntil) > now)
    const endpoint = `/api/admin/users/${user.id}/${isLocked ? "unlock" : "lock"}`

    try {
      const res = await fetch(endpoint, { method: "POST" })
      if (!res.ok) {
        console.error(await res.json())
      }
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b dark:border-zinc-800 text-zinc-500 uppercase">
          <tr>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Failed Attempts</th>
            <th className="px-6 py-3">Last Login</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-zinc-800">
          {users.map((user) => {
            const isLocked = !!(user.lockedUntil && new Date(user.lockedUntil) > new Date())
            return (
              <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 font-medium dark:text-zinc-200">
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-zinc-500">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${user.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700" : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${isLocked ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"}`}>
                    {isLocked ? "Locked" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">{user.failedLoginCount}</td>
                <td className="px-6 py-4 text-zinc-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleLock(user)}
                    disabled={busyUserId === user.id || user.role === "ADMIN"}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLocked ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-red-600 text-white hover:bg-red-700"}`}
                  >
                    {busyUserId === user.id ? "Processing..." : isLocked ? "Unlock" : "Lock"}
                  </button>
                </td>
              </tr>
            )
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
