'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Workout } from '@/lib/supabase'

const ACTIVITIES = ['Running', 'Yoga', 'Cycling', 'Gym', 'Swimming', 'HIIT', 'Walking', 'Boxing', 'Climbing', 'Other']

type Props = { onWorkoutAdded: (w: Workout) => void }

export default function WorkoutForm({ onWorkoutAdded }: Props) {
  const [activity, setActivity] = useState('Running')
  const [duration, setDuration] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!duration || Number(duration) <= 0) {
      setError('Enter a valid duration')
      return
    }
    setError('')
    setLoading(true)

    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, duration: Number(duration), date }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to save')
      return
    }

    onWorkoutAdded(data)
    setDuration('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="card p-6">
      <h2 className="font-display text-2xl tracking-wider text-white mb-5">
        LOG <span className="text-brand-400">WORKOUT</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity */}
        <div className="space-y-1.5">
          <label>Activity Type</label>
          <div className="grid grid-cols-5 gap-2">
            {ACTIVITIES.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setActivity(a)}
                className={`py-2 px-1 rounded-lg text-xs font-medium transition-all border ${
                  activity === a
                    ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                    : 'bg-[#0a0a0f] border-[#2e2e3e] text-gray-400 hover:border-brand-500/40 hover:text-gray-200'
                }`}
              >
                {ACTIVITY_ICONS[a]} {a}
              </button>
            ))}
          </div>
        </div>

        {/* Duration + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label>Duration (minutes)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 45"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              min="1"
              max="600"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label>Date</label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {success && (
          <p className="text-brand-400 text-sm bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
            ✓ Workout logged! Keep crushing it.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            '+ Log Workout'
          )}
        </button>
      </form>
    </div>
  )
}

const ACTIVITY_ICONS: Record<string, string> = {
  Running: '🏃', Yoga: '🧘', Cycling: '🚴', Gym: '🏋️', Swimming: '🏊',
  HIIT: '🔥', Walking: '🚶', Boxing: '🥊', Climbing: '🧗', Other: '⚡',
}
