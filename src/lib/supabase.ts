import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Запоминаем хэш до инициализации supabase-js: клиент разбирает ссылку
// восстановления пароля и очищает его, а нам нужно успеть понять, что это recovery.
const initialHash = typeof window !== 'undefined' ? window.location.hash : ''
export const isRecoveryRedirect = initialHash.includes('type=recovery')

export const isSupabaseConfigured = Boolean(url && anonKey)

// Заглушка нужна только чтобы приложение не падало до настройки .env.
// В этом случае вместо него показывается инструкция (см. SetupNotice).
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
