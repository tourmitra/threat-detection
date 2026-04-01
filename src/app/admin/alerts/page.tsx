import { db } from "@/lib/db"
import { auth } from "@/auth"

type Params = {
  searchParams: { page?: string }
}

export default async function AlertsPage({ searchParams }: Params) {
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-8"><div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium">Access Denied: Administrators only.</div></div>
  }

  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const skip = (page - 1) * limit

  const events = await db.securityEvent.findMany({
    where: { 
      severity: { in: ['HIGH', 'CRITICAL'] },
      status: { in: ['OPEN', 'INVESTIGATING'] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true
    },
    skip,
    take: limit,
  })

  // Basic styling mapping
  const severityColors: any = {
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    CRITICAL: "bg-red-50 text-red-700 border-red-200",
  }

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b dark:border-zinc-800 text-zinc-500 uppercase">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User (ID)</th>
              <th className="px-6 py-3">Event Type</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {events.map((ev: (typeof events)[number]) => (
              <tr key={ev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                  {new Date(ev.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium dark:text-zinc-200">
                  <div className="flex flex-col">
                    <span>{ev.user?.name || "Unknown Actor"}</span>
                    <span className="text-xs text-zinc-400 font-mono">{ev.user?.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium dark:text-zinc-200">
                  {ev.eventType} 
                  {ev.isAiAnomaly && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">AI</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${severityColors[ev.severity] || "bg-zinc-100 text-zinc-800"}`}>
                    {ev.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {ev.ipAddress} {ev.location ? `· ${ev.location}` : ""}
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline mr-3 font-medium">Investigate</button>
                  <button className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium">Resolve</button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-lg">
                  🎉 Good news! No active high-priority threats require your attention.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
