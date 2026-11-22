import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  formatMonthTitle,
  isFutureKey,
  maxMonth,
  minDayKey,
  minMonth,
  monthGrid,
  shiftMonth,
  toKey,
  WEEKDAYS,
} from '../lib/dates'
import { getMood } from '../lib/moods'
import type { Entry } from '../types'
import { IconChevronLeft, IconChevronRight } from './Icons'

interface CalendarProps {
  month: Date
  onMonthChange: (month: Date) => void
  entries: Map<string, Entry>
  selectedDay: string
  onSelectDay: (day: string) => void
}

export function Calendar({
  month,
  onMonthChange,
  entries,
  selectedDay,
  onSelectDay,
}: CalendarProps) {
  const canPrev = month.getTime() > minMonth().getTime()
  const canNext = month.getTime() < maxMonth().getTime()
  const isCurrentMonth = month.getTime() === maxMonth().getTime()
  const minDay = minDayKey()

  return (
    <div className="calendar">
      <div className="cal-head">
        <button
          type="button"
          className="round-btn round-btn--sm"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          disabled={!canPrev}
          aria-label="Предыдущий месяц"
        >
          <IconChevronLeft size={16} />
        </button>

        <div className="cal-title-block">
          <p className="cal-title">{formatMonthTitle(month)}</p>
          {!isCurrentMonth && (
            <button
              type="button"
              className="cal-reset"
              onClick={() => onMonthChange(maxMonth())}
            >
              текущий месяц
            </button>
          )}
        </div>

        <button
          type="button"
          className="round-btn round-btn--sm"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          disabled={!canNext}
          aria-label="Следующий месяц"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      <div className="cal-weekdays" aria-hidden>
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="cal-grid">
        {monthGrid(month).map((date) => {
          const key = toKey(date)
          const inMonth = date.getMonth() === month.getMonth()
          const disabled = !inMonth || isFutureKey(key) || key < minDay
          const entry = entries.get(key)
          const mood = getMood(entry?.mood)
          const today = key === toKey(new Date())
          const selected = key === selectedDay && inMonth

          const label = `${format(date, 'd MMMM', { locale: ru })}${
            mood ? `, настроение: ${mood.label}` : ''
          }${entry?.cried ? ', плакала' : ''}`

          return (
            <button
              key={key}
              type="button"
              className={[
                'cal-cell',
                !inMonth ? 'is-out' : '',
                disabled ? 'is-disabled' : '',
                today ? 'is-today' : '',
                selected ? 'is-selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={disabled}
              aria-label={label}
              aria-current={today ? 'date' : undefined}
              onClick={() => onSelectDay(key)}
            >
              <span className="cal-num">{format(date, 'd')}</span>
              {mood ? (
                <span className="cal-mood" aria-hidden>
                  {mood.emoji}
                </span>
              ) : entry ? (
                <span className="cal-dot" aria-hidden />
              ) : (
                <span className="cal-mood cal-mood--empty" aria-hidden />
              )}
              {entry?.cried && (
                <span className="cal-cry" aria-hidden>
                  🥲
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="cal-legend">
        <span aria-hidden>🥲</span> в уголке дня — были слёзы
      </p>
    </div>
  )
}
