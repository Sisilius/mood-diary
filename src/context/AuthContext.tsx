import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { isRecoveryRedirect, supabase } from '../lib/supabase'

const AUTH_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Неверный email или пароль',
  'Email not confirmed': 'Email не подтверждён — проверь почту',
  'User already registered': 'Пользователь с таким email уже существует',
  'Password should be at least 6 characters':
    'Пароль должен быть не короче 6 символов',
  'New password should be different from the old password':
    'Новый пароль должен отличаться от старого',
  'Email rate limit exceeded': 'Слишком много попыток. Попробуй чуть позже',
  'For security purposes, you can only request this after 60 seconds':
    'Повторно запросить можно через минуту',
}

const translateAuthError = (message: string): string => AUTH_MESSAGES[message] ?? message

interface AuthContextValue {
  session: Session | null
  loading: boolean
  /** Пользователь пришёл по ссылке восстановления пароля. */
  recovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  clearRecovery: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(isRecoveryRedirect)

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') setRecovery(false)
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    })
    if (error) throw new Error(translateAuthError(error.message))
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw new Error(translateAuthError(error.message))
    setRecovery(false)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const clearRecovery = useCallback(() => setRecovery(false), [])

  const value = useMemo(
    () => ({
      session,
      loading,
      recovery,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      clearRecovery,
    }),
    [session, loading, recovery, signIn, signOut, resetPassword, updatePassword, clearRecovery],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
