'use client'

import { Stats } from '@/lib/stats'

type Props = { stats: Stats; loading: boolean }

export default function StatsPanel({ stats, loading }: Props) {
  const tiles = [
    {
      label: 'Current Streak',
      value: stats.streak,
      suffix: stats.streak === 1 ? ' day' : ' days',
      icon: stats.streak >= 3 ? '🔥' : '📅',
      highlight: stats.streak >= 3,
      glow: 'rgba(249,115,22,0.15)',
      border: stats.streak >= 3 ? 'rgba(249,115,22,0.3)' : undefined,
    },
    {
      label: 'This Week',
      value: stats.workoutsThisWeek,
      suffix: stats.workoutsThisWeek === 1 ? ' session' : ' sessions',
      icon: '📆',
      highlight: false,
    },
    {
      label: 'Top Activity',
      value: stats.mostFrequentActivity,
      suffix: '',
      icon: '🏆',
      highlight: false,
      isText: true,
    },
    {
      label: 'Total Minutes',
      value: stats.totalMinutes,
      suffix: ' min',
      icon: '⏱️',
      highlight: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="card p-4 transition-all duration-300 hover:border-brand-500/30"
          style={{
            borderColor: tile.border,
            background: tile.highlight ? `radial-gradient(ellipse at top left, ${tile.glow}, transparent 60%), #111118` : undefined,
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500">{tile.label}</p>
            <span className="text-xl">{tile.icon}</span>
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#1a1a24] rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-1 flex-wrap">
              <span
                className={`font-display tracking-wide leading-none ${
                  tile.isText
                    ? 'text-2xl text-brand-400'
                    : tile.highlight
                    ? 'text-4xl text-orange-400'
                    : 'text-4xl text-white'
                }`}
                style={tile.highlight && tile.value >= 3 ? { textShadow: '0 0 20px rgba(249,115,22,0.5)' } : {}}
              >
                {tile.value}
              </span>
              <span className="text-sm text-gray-500">{tile.suffix}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
