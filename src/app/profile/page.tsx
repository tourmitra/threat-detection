import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  let user: Awaited<ReturnType<typeof db.user.findUnique>> = null
  try {
    user = await db.user.findUnique({ where: { id: session.user.id } })
  } catch {
    // Render with empty/fallback values if DB fails.
  }

  return (
    <div className="max-w-2xl space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-8">
        {/* Info Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Full Name</label>
              <input type="text" defaultValue={user?.name} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email</label>
              <input type="email" defaultValue={user?.email} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">City</label>
              <input type="text" defaultValue={user?.city} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Country</label>
              <input type="text" defaultValue={user?.country} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">System Role</label>
              <div className="px-3 py-2 border rounded-md dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                 {user?.role}
              </div>
            </div>
            <div className="text-xs text-zinc-500 pt-4">For demo purposes during the hackathon, fields are locked.</div>
          </div>
        </form>
      </div>
    </div>
  )
}
