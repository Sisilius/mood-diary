import { useState, type FormEvent } from 'react'
import { APP_NAME } from '../config'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'reset'

export function LoginScreen() {
  const { signIn, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (!email.trim()) {
      setError('Введи email')
      return
    }
    if (mode === 'login' && password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await resetPassword(email)
        setNotice('Если такой email есть, письмо уже летит. Проверь почту и перейди по ссылке.')
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Что-то пошло не так')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-emoji" aria-hidden>
          🌷
        </div>
        <h1 className="auth-title">{APP_NAME}</h1>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Маленький дневник о том, как прошёл день. Только для тебя.'
            : 'Пришлём ссылку для сброса пароля на почту.'}
        </p>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={busy}
          />

          {mode === 'login' && (
            <>
              <label className="auth-label" htmlFor="password">
                Пароль
              </label>
              <div className="password-wrap">
                <input
                  id="password"
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={busy}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  tabIndex={-1}
                >
                  {showPassword ? 'скрыть' : 'показать'}
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}

          <button className="primary-btn" type="submit" disabled={busy}>
            {busy ? 'Секунду…' : mode === 'login' ? 'Войти' : 'Отправить ссылку'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <button type="button" className="link-btn" onClick={() => switchMode('reset')}>
              Забыли пароль?
            </button>
          ) : (
            <button type="button" className="link-btn" onClick={() => switchMode('login')}>
              ← Назад ко входу
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
