'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Workout } from '@/lib/supabase'

const ACTIVITY_ICONS: Record<string, string> = {
  Running: '🏃', Yoga: '🧘', Cycling: '🚴', Gym: '🏋️', Swimming: '🏊',
  HIIT: '🔥', Walking: '🚶', Boxing: '🥊', Climbing: '🧗', Other: '⚡',
}

type Props = {
  workouts: Workout[]
  loading: boolean
  onDelete: (id: string) => void
}

export default function WorkoutHistory({ workouts, loading, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch(`/api/workouts?id=${id}`, { method: 'DELETE' })
    onDelete(id)
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="card p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-[#1a1a24] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!workouts.length) {
    return (
      <div className="card p-10 text-center">
        <p className="text-4xl mb-3">🏁</p>
        <p className="text-gray-400">No workouts yet. Log your first session!</p>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <h2 className="font-display text-2xl tracking-wider text-white mb-4">
        WORKOUT <span className="text-brand-400">HISTORY</span>
      </h2>
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {workouts.map((w, i) => (
          <div
            key={w.id}
            className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-[#1a1a24] hover:border-[#2e2e3e] transition-all group"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 text-center">{ACTIVITY_ICONS[w.activity] || '⚡'}</span>
              <div>
                <p className="text-sm font-medium text-gray-200">{w.activity}</p>
                <p className="text-xs text-gray-500">
                  {format(parseISO(w.date), 'MMM d, yyyy')} · {w.duration} min
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(w.id)}
              disabled={deleting === w.id}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs px-2 py-1 rounded hover:bg-red-500/10"
            >
              {deleting === w.id ? '...' : '✕'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
