'use client'

import { useState, useEffect, useCallback } from 'react'
import { Workout, CoachTone } from '@/lib/supabase'
import { computeStats } from '@/lib/stats'
import WorkoutForm from './WorkoutForm'
import StatsPanel from './StatsPanel'
import WorkoutHistory from './WorkoutHistory'
import MotivationPanel from './MotivationPanel'
import ChatWidget from './ChatWidget'

export default function FitCoachApp() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log')

  const fetchWorkouts = useCallback(async () => {
    const res = await fetch('/api/workouts')
    if (res.ok) {
      const data = await res.json()
      setWorkouts(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  const handleWorkoutAdded = (w: Workout) => {
    setWorkouts(prev => [w, ...prev])
    setActiveTab('history')
  }

  const handleWorkoutDeleted = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const stats = computeStats(workouts)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Header */}
      <header className="border-b border-[#1a1a24] sticky top-0 z-50 backdrop-blur-md bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-[#0a0a0f] font-bold text-lg select-none">
              ⚡
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-white leading-none">
                FITCOACH<span className="text-brand-400">AI</span>
              </h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Your AI Training Partner</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse inline-block"></span>
            Live
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <StatsPanel stats={stats} loading={loading} />

        {/* Motivation */}
        <MotivationPanel workouts={workouts} />

        {/* Log + History */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Tabs for Log/History */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex gap-1 p-1 rounded-lg bg-[#111118] border border-[#1a1a24] w-fit">
              {(['log', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-brand-500 text-[#0a0a0f]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'log' ? '+ Log Workout' : `History ${workouts.length > 0 ? `(${workouts.length})` : ''}`}
                </button>
              ))}
            </div>

            {activeTab === 'log' && (
              <div className="animate-slide-up">
                <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />
              </div>
            )}
            {activeTab === 'history' && (
              <div className="animate-slide-up">
                <WorkoutHistory
                  workouts={workouts}
                  loading={loading}
                  onDelete={handleWorkoutDeleted}
                />
              </div>
            )}
          </div>

          {/* Right: Activity Breakdown */}
          <div className="lg:col-span-2">
            <ActivityBreakdown stats={stats} />
          </div>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}

function ActivityBreakdown({ stats }: { stats: ReturnType<typeof computeStats> }) {
  const entries = Object.entries(stats.activityBreakdown).sort((a, b) => b[1] - a[1])
  const total = stats.totalWorkouts || 1

  const ACTIVITY_ICONS: Record<string, string> = {
    Running: '🏃', Yoga: '🧘', Cycling: '🚴', Gym: '🏋️', Swimming: '🏊',
    HIIT: '🔥', Walking: '🚶', Boxing: '🥊', Climbing: '🧗', Other: '⚡',
  }

  return (
    <div className="card p-5 h-full">
      <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Activity Breakdown</h3>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 text-sm">Log workouts to see your breakdown</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(([activity, count]) => (
            <div key={activity} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <span>{ACTIVITY_ICONS[activity] || '⚡'}</span>
                  {activity}
                </span>
                <span className="text-xs text-gray-500 font-mono">{count} × {Math.round(count / total * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1a1a24] overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-700"
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[#1a1a24] mt-2">
            <p className="text-xs text-gray-600 text-center">{total} total session{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}
