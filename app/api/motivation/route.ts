import { NextRequest, NextResponse } from 'next/server'
import { computeStats } from '@/lib/stats'
import { Workout, CoachTone } from '@/lib/supabase'

const TONE_PERSONAS: Record<CoachTone, string> = {
  tough: `You are a no-nonsense, drill-sergeant fitness coach. You're direct, intense, and don't sugarcoat. 
You use short punchy sentences. You push hard but you're fair. No fluff, just fire.`,
  friendly: `You are an enthusiastic, warm, supportive fitness buddy. You celebrate every win, big or small. 
You're energetic, use occasional emojis, and make the person feel genuinely great about their progress.`,
  data: `You are an analytical, data-driven performance coach. You speak in metrics, percentages, and trends. 
You give precise observations about the data patterns and suggest science-backed optimizations.`,
}

export async function POST(req: NextRequest) {
  const { workouts, tone = 'friendly' }: { workouts: Workout[], tone: CoachTone } = await req.json()

  const stats = computeStats(workouts)
  const persona = TONE_PERSONAS[tone] || TONE_PERSONAS.friendly

  const prompt = `${persona}

User's workout data:
- Total workouts logged: ${stats.totalWorkouts}
- Current streak: ${stats.streak} day(s)
- Workouts this week: ${stats.workoutsThisWeek}
- Total workout minutes: ${stats.totalMinutes} min (${Math.round(stats.totalMinutes / 60 * 10) / 10} hours)
- Most frequent activity: ${stats.mostFrequentActivity}
- Days since last workout: ${stats.gapDays === 999 ? 'never worked out' : stats.gapDays}
- Last workout date: ${stats.lastWorkoutDate || 'N/A'}
- Activity breakdown: ${JSON.stringify(stats.activityBreakdown)}

Generate a personalized motivational message (2–4 sentences) that MUST reference specific numbers and facts from the user's data above. Do NOT give a generic message. Be specific and make it feel personal.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  )

  const data = await response.json()
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keep pushing — you are doing great!'
  return NextResponse.json({ message })
}