import { NextResponse } from 'next/server'
import { db } from "@/lib/db"
import { IsolationForest } from 'isolation-forest'

function isAuthorizedCron(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET
  if (!configuredSecret) return true

  const authHeader = request.headers.get("authorization")
  return authHeader === `Bearer ${configuredSecret}`
}

export async function POST(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 1. Get recent users with recent activity
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // In a real system, you'd iterate through active users or use a cron job
    // We'll get all events from the last 24 hours to analyze
    const recentEvents = await db.securityEvent.findMany({
      where: {
        createdAt: { gte: lastDay },
        isAiAnomaly: false // don't flag already flagged ones
      },
      include: {
        user: true
      },
      take: 1000
    })

    if (recentEvents.length < 10) {
      return NextResponse.json({ message: "Not enough data to train model" }, { status: 200 })
    }

    // 2. Feature Extraction
    // Features: [ Hour of day (0-23), FailedLoginCount ]
    const dataset = recentEvents.map((event: (typeof recentEvents)[number]) => {
      const hour = new Date(event.createdAt).getHours()
      const failedCount = event.user?.failedLoginCount ?? 0
      return { hour, failedCount }
    })

    // 3. Train Isolation Forest
    const isolationForest = new IsolationForest()
    isolationForest.fit(dataset)

    // 4. Predict
    const anomalies = []
    const predictions = isolationForest.predict(dataset)

    for (let i = 0; i < predictions.length; i++) {
        // threshold can be tuned
      if (predictions[i] > 0.6) {
        anomalies.push({ event: recentEvents[i], score: predictions[i] })
      }
    }

    // 5. Update flagged events in the database
    if (anomalies.length > 0) {
      for (const anomaly of anomalies) {
        await db.securityEvent.update({
          where: { id: anomaly.event.id },
          data: {
            isAiAnomaly: true,
            anomalyScore: anomaly.score,
            severity: 'HIGH' // Escalate severity because of AI flag
          }
        })
      }
      
      // Bonus: Could proactively send alert channels here based on PRD.
    }

    return NextResponse.json({ 
        message: "Anomaly detection complete", 
        processed: recentEvents.length,
        flagged: anomalies.length 
    }, { status: 200 })

  } catch (error) {
    console.error("Anomaly Detection Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
