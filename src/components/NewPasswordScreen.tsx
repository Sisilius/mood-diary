import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'

export function NewPasswordScreen() {
  const { updatePassword, clearRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    if (password !== repeat) {
      setError('Пароли не совпадают')
      return
    }

    setBusy(true)
    try {
      await updatePassword(password)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Не получилось обновить пароль')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-emoji" aria-hidden>
          🔑
        </div>
        <h1 className="auth-title">Новый пароль</h1>
        <p className="auth-sub">Придумай пароль, которым будешь заходить в дневник.</p>

        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="auth-label" htmlFor="new-password">
            Новый пароль
          </label>
          <input
            id="new-password"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />

          <label className="auth-label" htmlFor="repeat-password">
            Ещё раз
          </label>
          <input
            id="repeat-password"
            className="input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••"
            value={repeat}
            onChange={(event) => setRepeat(event.target.value)}
            disabled={busy}
          />

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="primary-btn" type="submit" disabled={busy}>
            {busy ? 'Сохраняю…' : 'Сохранить пароль'}
          </button>
        </form>

        <div className="auth-links">
          <button type="button" className="link-btn" onClick={clearRecovery}>
            Пропустить
          </button>
        </div>
      </div>
    </div>
  )
}
