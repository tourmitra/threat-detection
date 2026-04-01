import { db } from "@/lib/db"
import { auth } from "@/auth"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) return null

  const user = await db.user.findUnique({ where: { id: session.user.id } })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex justify-between items-center mb-6 border-b dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-zinc-500 text-sm">Manage your profile and notification settings.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-8">
        {/* Info Form */}
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Full Name</label>
              <input type="text" defaultValue={user?.name} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" defaultValue={user?.email} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <input type="text" defaultValue={user?.city} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <input type="text" defaultValue={user?.country} className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 disabled:opacity-75 disabled:cursor-not-allowed" disabled />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">System Role</label>
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
