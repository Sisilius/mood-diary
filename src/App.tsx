import { useCallback, useState } from 'react'
import { startOfMonth } from 'date-fns'
import { DayPage } from './components/DayPage'
import { LoginScreen } from './components/LoginScreen'
import { NewPasswordScreen } from './components/NewPasswordScreen'
import { SetupNotice } from './components/SetupNotice'
import { Splash } from './components/Splash'
import { StatsPage } from './components/StatsPage'
import { TabBar } from './components/TabBar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useEntries } from './hooks/useEntries'
import { minDayKey, shiftKey, todayKey } from './lib/dates'
import { isSupabaseConfigured } from './lib/supabase'
import type { EntryDraft, Tab } from './types'

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}

function Root() {
  const { session, loading, recovery } = useAuth()

  if (loading) return <Splash />
  if (session && recovery) return <NewPasswordScreen />
  if (!session) return <LoginScreen />

  return <Diary userId={session.user.id} />
}

function Diary({ userId }: { userId: string }) {
  const { entries, loading, error, reload, save } = useEntries(userId)
  const [tab, setTab] = useState<Tab>('day')
  const [day, setDay] = useState<string>(() => todayKey())
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [statsMonth, setStatsMonth] = useState(() => startOfMonth(new Date()))

  const today = todayKey()
  const canPrev = day > minDayKey()
  const canNext = day < today

  const goTo = (next: string) => {
    if (next === day) return
    setDirection(next > day ? 'next' : 'prev')
    setDay(next)
  }

  const saveDay = useCallback(
    async (draft: EntryDraft) => {
      await save(day, draft)
    },
    [save, day],
  )

  if (loading) return <Splash />

  if (error) {
    return (
      <div className="app">
        <div className="card state-card">
          <div className="state-emoji" aria-hidden>
            ☁️
          </div>
          <h1>Не получилось загрузить дневник</h1>
          <p>{error}</p>
          <button className="primary-btn" type="button" onClick={() => void reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {tab === 'day' ? (
        <div className={`day-scene day-scene--${direction}`} key={day}>
          <DayPage
            day={day}
            entry={entries.get(day)}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => {
              if (canPrev) goTo(shiftKey(day, -1))
            }}
            onNext={() => {
              if (canNext) goTo(shiftKey(day, 1))
            }}
            onToday={() => goTo(today)}
            onSave={saveDay}
          />
        </div>
      ) : (
        <StatsPage
          entries={entries}
          month={statsMonth}
          onMonthChange={setStatsMonth}
          selectedDay={day}
          onSelectDay={(nextDay) => {
            goTo(nextDay)
            setTab('day')
          }}
        />
      )}

      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
