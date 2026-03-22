'use client'

import { useState } from 'react'
import { Workout, CoachTone } from '@/lib/supabase'

const TONE_OPTIONS: { value: CoachTone; label: string; emoji: string; desc: string }[] = [
  { value: 'friendly', label: 'Friendly Buddy', emoji: '😊', desc: 'Warm & encouraging' },
  { value: 'tough', label: 'Tough Coach', emoji: '🔥', desc: 'No-nonsense, intense' },
  { value: 'data', label: 'Data Nerd', emoji: '📊', desc: 'Analytics & metrics' },
]

type Props = { workouts: Workout[] }

export default function MotivationPanel({ workouts }: Props) {
  const [tone, setTone] = useState<CoachTone>('friendly')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getMotivation = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const res = await fetch('/api/motivation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workouts, tone }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Could not generate message')
      return
    }
    setMessage(data.message)
  }

  return (
    <div className="card-glow p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-2xl tracking-wider text-white">
            AI <span className="text-brand-400">MOTIVATION</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Personalized to your actual workout data</p>
        </div>

        {/* Tone picker */}
        <div className="flex gap-2 flex-wrap">
          {TONE_OPTIONS.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                tone === t.value
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                  : 'bg-[#0a0a0f] border-[#2e2e3e] text-gray-400 hover:border-brand-500/40'
              }`}
            >
              <span>{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <button
          onClick={getMotivation}
          disabled={loading || workouts.length === 0}
          className="btn-primary whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
              Thinking...
            </>
          ) : (
            <>⚡ Get Motivation</>
          )}
        </button>

        <div className="flex-1 min-h-[44px]">
          {workouts.length === 0 && !message && (
            <p className="text-gray-600 text-sm py-2.5">Log at least one workout to unlock AI motivation.</p>
          )}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}
          {message && (
            <div className="bg-[#0a0a0f] border border-brand-500/30 rounded-lg px-4 py-3 animate-fade-in">
              <p className="text-sm text-gray-200 leading-relaxed">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
