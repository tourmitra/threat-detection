import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

type Params = {
  searchParams: { page?: string, severity?: string, status?: string }
}

export default async function LogsPage({ searchParams }: Params) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }
  
  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = { userId: session.user.id }
  if (searchParams.severity) where.severity = searchParams.severity
  if (searchParams.status) where.status = searchParams.status

  let logs: Awaited<ReturnType<typeof db.securityEvent.findMany>> = []

  try {
    logs = await db.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })
  } catch {
    // Keep logs empty instead of crashing production render.
  }

  // Basic styling mapping
  const severityColors: any = {
    INFO: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
    LOW: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900",
    CRITICAL: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  }

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b dark:border-zinc-800 text-zinc-500 uppercase">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Event Type</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">IP / Location</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            {logs.map((log: (typeof logs)[number]) => (
              <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-medium dark:text-zinc-200">
                  {log.eventType} 
                  {log.isAiAnomaly && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-900/30 dark:text-indigo-400">AI Flagged</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${severityColors[log.severity]}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {log.ipAddress} {log.location ? `· ${log.location}` : ""}
                </td>
                <td className="px-6 py-4 text-zinc-500">
                  {log.status}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No security events found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
