import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')

  if (!city) {
    // If not provided, fetch user's city
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { city: true } })
    if (user?.city) {
      return fetchWeather(user.city)
    }
    return new NextResponse("City required", { status: 400 })
  }

  return fetchWeather(city)
}

async function fetchWeather(city: string) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) {
    // Fallback for hackathon demo purposes if API key is missing
    return NextResponse.json({
      name: city,
      main: { temp: 22 },
      weather: [{ description: "Partly Cloudy", main: "Clouds", icon: "02d" }]
    })
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`, {
      next: { revalidate: 1800 } // cache for 30 minutes
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return new NextResponse("Failed to fetch weather", { status: 500 })
  }
}
