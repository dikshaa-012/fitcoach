import { Workout } from './supabase'
import { 
  startOfWeek, endOfWeek, isWithinInterval, parseISO, 
  differenceInCalendarDays, subDays, format 
} from 'date-fns'

export type Stats = {
  streak: number
  workoutsThisWeek: number
  mostFrequentActivity: string
  totalMinutes: number
  totalWorkouts: number
  lastWorkoutDate: string | null
  activityBreakdown: Record<string, number>
  gapDays: number
}

export function computeStats(workouts: Workout[]): Stats {
  if (!workouts.length) {
    return {
      streak: 0,
      workoutsThisWeek: 0,
      mostFrequentActivity: '—',
      totalMinutes: 0,
      totalWorkouts: 0,
      lastWorkoutDate: null,
      activityBreakdown: {},
      gapDays: 0,
    }
  }

  const today = new Date()
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0)
  const totalWorkouts = workouts.length

  // Activity breakdown
  const activityBreakdown: Record<string, number> = {}
  workouts.forEach(w => {
    activityBreakdown[w.activity] = (activityBreakdown[w.activity] || 0) + 1
  })
  const mostFrequentActivity = Object.entries(activityBreakdown)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  // Workouts this week
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const workoutsThisWeek = workouts.filter(w => {
    const d = parseISO(w.date)
    return isWithinInterval(d, { start: weekStart, end: weekEnd })
  }).length

  // Streak - consecutive days up to today
  const workoutDays = new Set(workouts.map(w => w.date.slice(0, 10)))
  let streak = 0
  let checkDate = today
  // Allow today or yesterday to start a streak
  if (!workoutDays.has(format(today, 'yyyy-MM-dd'))) {
    checkDate = subDays(today, 1)
  }
  while (workoutDays.has(format(checkDate, 'yyyy-MM-dd'))) {
    streak++
    checkDate = subDays(checkDate, 1)
  }

  // Last workout date
  const sortedDates = Array.from(workoutDays).sort().reverse()
  const lastWorkoutDate = sortedDates[0] || null

  // Gap days since last workout
  const gapDays = lastWorkoutDate
    ? differenceInCalendarDays(today, parseISO(lastWorkoutDate))
    : 999

  return {
    streak,
    workoutsThisWeek,
    mostFrequentActivity,
    totalMinutes,
    totalWorkouts,
    lastWorkoutDate,
    activityBreakdown,
    gapDays,
  }
}
