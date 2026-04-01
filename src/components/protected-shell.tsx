import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navigation from "@/components/navigation"
import WeatherWidget from "@/components/weather-widget"

type ProtectedShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export default async function ProtectedShell({ title, subtitle, children }: ProtectedShellProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const userCity = session.user.city || "London"

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex transition-colors duration-500 text-zinc-900 dark:text-zinc-100">
      <Navigation />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">{subtitle}</p>
          </div>
          <WeatherWidget userCity={userCity} />
        </header>

        {children}
      </main>
    </div>
  )
}
