import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Entry, EntryDraft } from '../types'

const toEntry = (row: Record<string, unknown>): Entry => ({
  id: String(row.id),
  user_id: String(row.user_id),
  day: String(row.day),
  mood: (row.mood as Entry['mood']) ?? null,
  cried: Boolean(row.cried),
  trigger_note: (row.trigger_note as string | null) ?? null,
  good_note: (row.good_note as string | null) ?? null,
  created_at: String(row.created_at),
  updated_at: String(row.updated_at),
})

export interface EntriesState {
  entries: Map<string, Entry>
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  save: (day: string, draft: EntryDraft) => Promise<Entry>
}

export function useEntries(userId: string): EntriesState {
  const [entries, setEntries] = useState<Map<string, Entry>>(() => new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const entriesRef = useRef(entries)
  const seqRef = useRef(new Map<string, number>())

  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: loadError } = await supabase
      .from('entries')
      .select('*')
      .order('day', { ascending: true })

    if (loadError) {
      setError(loadError.message)
      setLoading(false)
      return
    }

    const next = new Map<string, Entry>()
    for (const row of data ?? []) {
      const entry = toEntry(row as Record<string, unknown>)
      next.set(entry.day, entry)
    }
    setEntries(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (userId) void load()
  }, [userId, load])

  const save = useCallback(
    async (day: string, draft: EntryDraft): Promise<Entry> => {
      const previous = entriesRef.current.get(day)
      const now = new Date().toISOString()
      const optimistic: Entry = {
        id: previous?.id ?? `pending-${day}`,
        user_id: userId,
        day,
        mood: draft.mood,
        cried: draft.cried,
        trigger_note: draft.trigger_note,
        good_note: draft.good_note,
        created_at: previous?.created_at ?? now,
        updated_at: now,
      }

      const seq = (seqRef.current.get(day) ?? 0) + 1
      seqRef.current.set(day, seq)

      setEntries((current) => {
        const next = new Map(current)
        next.set(day, optimistic)
        return next
      })

      const { data, error: saveError } = await supabase
        .from('entries')
        .upsert(
          {
            user_id: userId,
            day,
            mood: draft.mood,
            cried: draft.cried,
            trigger_note: draft.trigger_note,
            good_note: draft.good_note,
          },
          { onConflict: 'user_id,day' },
        )
        .select()
        .single()

      if (saveError) throw new Error(saveError.message)

      const saved = toEntry(data as Record<string, unknown>)

      // Не перезаписываем более свежее локальное изменение устаревшим ответом.
      if (seqRef.current.get(day) === seq) {
        setEntries((current) => {
          const next = new Map(current)
          next.set(day, saved)
          return next
        })
      }

      return saved
    },
    [userId],
  )

  return { entries, loading, error, reload: load, save }
}
