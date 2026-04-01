import { headers } from "next/headers"

// Server action to trigger anomaly detection (for the sake of the hackathon)
export async function triggerAnomalyDetection() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  try {
    const res = await fetch(`${baseUrl}/api/anomaly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log("Anomaly trigger response:", await res.json())
  } catch (error) {
    console.error("Failed to trigger anomaly detection bg task", error)
  }
}
