import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { formatDayTitle, todayKey } from '../lib/dates'
import type { Entry, EntryDraft } from '../types'
import { CryToggle } from './CryToggle'
import { IconCheck, IconChevronLeft, IconChevronRight, IconToday } from './Icons'
import { MoodPicker } from './MoodPicker'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface DayPageProps {
  day: string
  entry?: Entry
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSave: (draft: EntryDraft) => Promise<void>
}

const toDraft = (entry?: Entry): EntryDraft => ({
  mood: entry?.mood ?? null,
  cried: entry?.cried ?? false,
  trigger_note: entry?.trigger_note ?? '',
  good_note: entry?.good_note ?? '',
})

const SAVE_DELAY_MS = 500
const SWIPE_THRESHOLD = 56

export function DayPage({
  day,
  entry,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onToday,
  onSave,
}: DayPageProps) {
  const [draft, setDraft] = useState<EntryDraft>(() => toDraft(entry))
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [errorText, setErrorText] = useState<string | null>(null)

  const draftRef = useRef(draft)
  const dirtyRef = useRef(false)
  const timerRef = useRef<number | null>(null)
  const statusTimerRef = useRef<number | null>(null)
  const mountedRef = useRef(true)

  const startRef = useRef<{ x: number; y: number; id: number } | null>(null)
  const dragRef = useRef(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const flush = useCallback(
    async (force = false) => {
      if (!dirtyRef.current && !force) return
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }

      const payload = draftRef.current
      dirtyRef.current = false
      setStatus('saving')
      setErrorText(null)

      try {
        await onSave(payload)
        if (!mountedRef.current) return
        setStatus('saved')
        if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current)
        statusTimerRef.current = window.setTimeout(() => {
          if (mountedRef.current) setStatus('idle')
        }, 2000)
      } catch (error) {
        if (!mountedRef.current) return
        dirtyRef.current = true
        setStatus('error')
        setErrorText(error instanceof Error ? error.message : 'Не удалось сохранить')
      }
    },
    [onSave],
  )

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      if (statusTimerRef.current !== null) window.clearTimeout(statusTimerRef.current)
      if (dirtyRef.current) {
        // Уходим на другой день / вкладку — досохраняем последние правки.
        void onSave(draftRef.current).catch(() => undefined)
      }
    }
  }, [onSave])

  const update = (patch: Partial<EntryDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...patch }
      draftRef.current = next
      return next
    })
    dirtyRef.current = true
    setStatus('idle')
    setErrorText(null)

    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      void flush()
    }, SAVE_DELAY_MS)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, textarea, select, [data-no-swipe]')) return
    startRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const start = startRef.current
    if (!start || start.id !== event.pointerId) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y

    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy)) return

    if (!dragging) {
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const blocked = (dx < 0 && !canNext) || (dx > 0 && !canPrev)
    const limit = blocked ? 26 : 110
    const next = Math.max(-limit, Math.min(limit, dx))
    dragRef.current = next
    setDragX(next)
  }

  const endDrag = () => {
    if (!startRef.current) return
    startRef.current = null
    const dx = dragRef.current
    dragRef.current = 0
    setDragX(0)
    setDragging(false)

    if (Math.abs(dx) < SWIPE_THRESHOLD) return
    if (dx < 0 && canNext) onNext()
    if (dx > 0 && canPrev) onPrev()
  }

  const cancelDrag = () => {
    startRef.current = null
    dragRef.current = 0
    setDragX(0)
    setDragging(false)
  }

  const isToday = day === todayKey()

  return (
    <section
      className={`day${dragging ? ' is-dragging' : ''}`}
      style={dragX !== 0 ? { transform: `translate3d(${dragX}px, 0, 0)` } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={cancelDrag}
    >
      <header className="day-head">
        <div>
          <p className="day-kicker">{isToday ? 'сегодня' : 'дневник'}</p>
          <h1 className="day-date">{formatDayTitle(day)}</h1>
        </div>
        <div className="day-nav">
          <button
            type="button"
            className="round-btn"
            onClick={onPrev}
            disabled={!canPrev}
            aria-label="Предыдущий день"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            className="round-btn"
            onClick={onNext}
            disabled={!canNext}
            aria-label="Следующий день"
          >
            <IconChevronRight />
          </button>
        </div>
      </header>

      <div className="day-meta">
        <span
          className={`save-state${status === 'saved' ? ' is-saved' : ''}${
            status === 'error' ? ' is-error' : ''
          }`}
          aria-live="polite"
        >
          {status === 'saved' && <IconCheck />}
          {status === 'saving' ? 'Сохраняю…' : status === 'saved' ? 'Сохранено' : ''}
        </span>
        {!isToday && (
          <button type="button" className="today-chip" onClick={onToday}>
            <IconToday size={13} />К сегодня
          </button>
        )}
      </div>

      <div className="card">
        <h2 className="card-title">Как настроение?</h2>
        <MoodPicker value={draft.mood} onChange={(mood) => update({ mood })} />
        <CryToggle value={draft.cried} onChange={(cried) => update({ cried })} isToday={isToday} />
      </div>

      <div className="card">
        <div className="field">
          <label htmlFor={`trigger-${day}`}>Что стриггерило?</label>
          <textarea
            id={`trigger-${day}`}
            value={draft.trigger_note}
            onChange={(event) => update({ trigger_note: event.target.value })}
            placeholder="Например: устала, поссорились, слишком много дел"
            rows={3}
            maxLength={2000}
          />
        </div>

        <div className="field">
          <label htmlFor={`good-${day}`}>Что было хорошего?</label>
          <textarea
            id={`good-${day}`}
            value={draft.good_note}
            onChange={(event) => update({ good_note: event.target.value })}
            placeholder="Например: прогулка, вкусный кофе, обнимашки"
            rows={3}
            maxLength={2000}
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="save-error" role="alert">
          <span>Не получилось сохранить: {errorText}</span>
          <button type="button" onClick={() => void flush(true)}>
            Повторить
          </button>
        </div>
      )}

      <p className="day-hint">
        Всё сохраняется само. Можно вернуться в любой день и дописать.
      </p>
    </section>
  )
}
