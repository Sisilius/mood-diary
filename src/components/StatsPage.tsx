import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  formatMonthTitle,
  isSameMonthKey,
  shiftKey,
  todayKey,
} from '../lib/dates'
import { getMood } from '../lib/moods'
import type { Entry } from '../types'
import { Calendar } from './Calendar'
import { IconLogout } from './Icons'
import { MoodChart } from './MoodChart'

interface StatsPageProps {
  entries: Map<string, Entry>
  month: Date
  onMonthChange: (month: Date) => void
  selectedDay: string
  onSelectDay: (day: string) => void
}

const RANGES = [7, 30, 90] as const

const formatAverage = (value: number) =>
  value.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const calcStreak = (entries: Map<string, Entry>): number => {
  let cursor = todayKey()
  if (!entries.get(cursor)?.mood) cursor = shiftKey(cursor, -1)

  let streak = 0
  while (entries.get(cursor)?.mood && streak < 10_000) {
    streak += 1
    cursor = shiftKey(cursor, -1)
  }
  return streak
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export function StatsPage({
  entries,
  month,
  onMonthChange,
  selectedDay,
  onSelectDay,
}: StatsPageProps) {
  const { signOut, session } = useAuth()
  const [range, setRange] = useState<number>(30)
  const [signingOut, setSigningOut] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  const monthStats = useMemo(() => {
    const filled = [...entries.values()].filter(
      (entry) => entry.mood !== null && isSameMonthKey(entry.day, month),
    )
    const cried = [...entries.values()].filter(
      (entry) => entry.cried && isSameMonthKey(entry.day, month),
    ).length

    const sum = filled.reduce((total, entry) => total + (entry.mood ?? 0), 0)
    return {
      filled: filled.length,
      cried,
      average: filled.length > 0 ? sum / filled.length : null,
    }
  }, [entries, month])

  const streak = useMemo(() => calcStreak(entries), [entries])

  const chartAverage = useMemo(() => {
    let sum = 0
    let count = 0
    let cursor = todayKey()
    for (let i = 0; i < range; i += 1) {
      const mood = entries.get(cursor)?.mood
      if (mood) {
        sum += mood
        count += 1
      }
      cursor = shiftKey(cursor, -1)
    }
    return count > 0 ? sum / count : null
  }, [entries, range])

  const handleSignOut = async () => {
    setSigningOut(true)
    setSignError(null)
    try {
      await signOut()
    } catch (error) {
      setSignError(error instanceof Error ? error.message : 'Не получилось выйти')
    } finally {
      setSigningOut(false)
    }
  }

  const averageMood = monthStats.average !== null ? getMood(Math.round(monthStats.average)) : null

  return (
    <section className="stats">
      <header className="page-head">
        <p className="page-kicker">дневник настроения</p>
        <h1 className="page-title">Статистика</h1>
      </header>

      <div className="card">
        <Calendar
          month={month}
          onMonthChange={onMonthChange}
          entries={entries}
          selectedDay={selectedDay}
          onSelectDay={onSelectDay}
        />

        <div className="stat-row">
          <Stat
            value={
              monthStats.average !== null
                ? `${formatAverage(monthStats.average)} ${averageMood?.emoji ?? ''}`
                : '—'
            }
            label="среднее"
          />
          <Stat value={String(monthStats.filled)} label="заполнено" />
          <Stat value={String(monthStats.cried)} label="со слезами" />
          <Stat value={String(streak)} label="серия" />
        </div>
        <p className="stat-caption">
          {formatMonthTitle(month)} · серия — текущая
        </p>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <h2 className="card-title">Динамика</h2>
            <p className="card-note">
              {chartAverage !== null
                ? `среднее ${formatAverage(chartAverage)} ${getMood(Math.round(chartAverage))?.emoji ?? ''}`
                : 'пока нет данных'}
            </p>
          </div>
          <div className="segmented" role="group" aria-label="Период графика">
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                className={range === value ? 'is-active' : undefined}
                aria-pressed={range === value}
                onClick={() => setRange(value)}
              >
                {value} дн.
              </button>
            ))}
          </div>
        </div>

        <MoodChart entries={entries} days={range} />
      </div>

      <footer className="account">
        <div className="account-info">
          <span className="stat-label">аккаунт</span>
          <span className="account-email">{session?.user.email ?? ''}</span>
        </div>
        <button
          type="button"
          className="ghost-btn"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
        >
          <IconLogout />
          {signingOut ? 'Выхожу…' : 'Выйти'}
        </button>
      </footer>
      {signError && <p className="form-error">{signError}</p>}
    </section>
  )
}
