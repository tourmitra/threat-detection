import { db } from "@/lib/db"
import { AlertCircle, AlertTriangle, ShieldCheck, Activity } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

type DashboardStats = {
  total: number
  activeThreats: number
  anomalies: number
  alertsSent: number
}

async function getStats(userId: string): Promise<DashboardStats> {
  const total = await db.securityEvent.count({ where: { userId } })
  const activeThreats = await db.securityEvent.count({ 
    where: { userId, status: { in: ['OPEN', 'INVESTIGATING'] }, severity: { in: ['HIGH', 'CRITICAL'] } }
  })
  const anomalies = await db.securityEvent.count({
    where: { userId, isAiAnomaly: true }
  })

  // Mock alerts sent until full implementation
  const alertsSent = 0 

  return { total, activeThreats, alertsSent, anomalies }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  let stats: DashboardStats = {
    total: 0,
    activeThreats: 0,
    anomalies: 0,
    alertsSent: 0,
  }

  try {
    stats = await getStats(session.user.id)
  } catch {
    // Fail open on dashboard stats to avoid hard-crashing Server Components in production.
  }

  return (
    <div className="space-y-8 text-zinc-900 dark:text-zinc-100">
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-tight">Total Events</h3>
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{stats.total}</div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-500 tracking-tight">Active Threats</h3>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-red-500">{stats.activeThreats}</div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-500 tracking-tight">AI Anomalies</h3>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-blue-500">{stats.anomalies}</div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-500 tracking-tight">Alerts Sent</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-500">{stats.alertsSent}</div>
        </div>
      </div>

      {/* Recents area (logs page will have full details) */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow p-6">
        <h2 className="font-semibold text-lg border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">Latest Security Events</h2>
        <div className="space-y-4">
          <div className="text-sm text-zinc-500">Go to Security Logs to see full history and detail.</div>
        </div>
      </div>
    </div>
  )
}
