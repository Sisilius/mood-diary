import type { CSSProperties } from 'react'
import { MOODS } from '../lib/moods'
import type { Mood } from '../types'

interface MoodPickerProps {
  value: Mood | null
  onChange: (mood: Mood) => void
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="mood-grid" role="group" aria-label="Настроение">
      {MOODS.map((mood) => {
        const active = value === mood.value
        return (
          <button
            key={mood.value}
            type="button"
            className={`mood-btn${active ? ' is-active' : ''}`}
            style={{ '--mood-color': mood.color } as CSSProperties}
            aria-pressed={active}
            aria-label={mood.label}
            onClick={() => onChange(mood.value)}
          >
            <span className="mood-emoji" aria-hidden>
              {mood.emoji}
            </span>
            <span className="mood-label">{mood.label}</span>
          </button>
        )
      })}
    </div>
  )
}
