/** 1 — очень плохо, 5 — супер. */
export type Mood = 1 | 2 | 3 | 4 | 5

/** Строка таблицы public.entries. */
export interface Entry {
  id: string
  user_id: string
  /** Локальная дата в формате yyyy-MM-dd. */
  day: string
  mood: Mood | null
  cried: boolean
  trigger_note: string | null
  good_note: string | null
  created_at: string
  updated_at: string
}

/** То, что редактируется на странице дня. */
export interface EntryDraft {
  mood: Mood | null
  cried: boolean
  trigger_note: string
  good_note: string
}

export type Tab = 'day' | 'stats'
