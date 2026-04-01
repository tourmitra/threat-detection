"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, List, ShieldAlert, User as UserIcon, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/logs", label: "Security Logs", icon: List },
    { href: "/profile", label: "Profile", icon: UserIcon },
    // Only conditionally show this to admins in a real app, but for now we show it based on session role internally
    { href: "/admin/alerts", label: "Alerts", icon: ShieldAlert },
  ]

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-zinc-950 border-r dark:border-zinc-800 p-4 space-y-8 flex flex-col">
      <div className="flex px-2 space-x-2 items-center">
        <ShieldAlert className="w-8 h-8 text-black dark:text-white" />
        <span className="font-bold text-xl tracking-tighter">ASPIREX26</span>
      </div>
      
      <div className="space-y-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  )
}