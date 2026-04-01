"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react"

export default function WeatherWidget({ userCity }: { userCity: string }) {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getWeather() {
      try {
        const res = await fetch(`/api/weather?city=${encodeURIComponent(userCity)}`)
        if (res.ok) {
          setWeather(await res.json())
        }
      } finally {
        setLoading(false)
      }
    }
    
    getWeather()
  }, [userCity])

  // Dynamic icon
  const getIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear': return <Sun className="w-6 h-6 text-amber-500" />
      case 'rain': 
      case 'drizzle': return <CloudRain className="w-6 h-6 text-blue-400" />
      case 'thunderstorm': return <CloudLightning className="w-6 h-6 text-red-500" />
      case 'snow': return <CloudSnow className="w-6 h-6 text-blue-200" />
      default: return <Cloud className="w-6 h-6 text-zinc-400" />
    }
  }

  // Update document body style / theme based on weather
  useEffect(() => {
    if (!weather) return;
    const body = document.documentElement; // using the root html element
    const condition = weather.weather[0].main.toLowerCase()

    // Resets:
    body.classList.remove('theme-clear', 'theme-rain', 'theme-storm', 'theme-snow', 'theme-clouds')

    if (condition === 'clear') body.classList.add('theme-clear') // amber tones
    else if (condition === 'rain' || condition === 'drizzle') body.classList.add('theme-rain')
    else if (condition === 'thunderstorm') body.classList.add('theme-storm')
    else if (condition === 'snow') body.classList.add('theme-snow')
    else body.classList.add('theme-clouds')

  }, [weather])

  if (loading) return <div className="animate-pulse h-12 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
  if (!weather || !weather.main) return null

  return (
    <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 px-4 py-2 rounded-lg shadow-sm">
      {getIcon(weather.weather[0].main)}
      <div className="flex flex-col text-sm">
        <span className="font-semibold">{Math.round(weather.main.temp)}°C</span>
        <span className="text-zinc-500 text-xs">{weather.name}</span>
      </div>
    </div>
  )
}
