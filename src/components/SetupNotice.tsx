export function SetupNotice() {
  return (
    <div className="auth">
      <div className="auth-card setup-card">
        <div className="auth-emoji" aria-hidden>
          🛠️
        </div>
        <h1 className="auth-title">Осталось подключить Supabase</h1>
        <p className="auth-sub">
          Приложению нужны адрес проекта и публичный ключ. Создай файл <code>.env</code> в корне
          проекта:
        </p>
        <pre className="code-block">
          {`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
        </pre>
        <p className="auth-sub">
          Значения лежат в Supabase → Project Settings → API. После этого перезапусти{' '}
          <code>npm run dev</code>. Полная инструкция — в <code>README.md</code>.
        </p>
      </div>
    </div>
  )
}
