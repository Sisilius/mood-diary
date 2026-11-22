import type { Mood } from '../types'

export interface MoodInfo {
  value: Mood
  emoji: string
  label: string
  /** Пастельный акцент для выбранной карточки. */
  color: string
}

export const MOODS: MoodInfo[] = [
  { value: 1, emoji: '😭', label: 'очень плохо', color: '#f3b7c0' },
  { value: 2, emoji: '😣', label: 'плохо', color: '#f7c9bd' },
  { value: 3, emoji: '😐', label: 'нормально', color: '#f4ddb4' },
  { value: 4, emoji: '😛', label: 'хорошо', color: '#d5e7bf' },
  { value: 5, emoji: '🤪', label: 'супер', color: '#b9ded6' },
]

export const getMood = (value: Mood | number | null | undefined): MoodInfo | null =>
  MOODS.find((mood) => mood.value === value) ?? null

export const isMood = (value: unknown): value is Mood =>
  typeof value === 'number' && value >= 1 && value <= 5 && Number.isInteger(value)
