import Navigation from "@/components/navigation"
import WeatherWidget from "@/components/weather-widget"
import { auth } from "@/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const userCity = session?.user?.city || "London"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex transition-colors duration-500">
      <Navigation />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Security Center</h2>
            <p className="text-zinc-500 text-sm">Real-time threat detection and contextual security posture.</p>
          </div>
          <WeatherWidget userCity={userCity} />
        </header>

        {children}
      </main>
    </div>
  )
}