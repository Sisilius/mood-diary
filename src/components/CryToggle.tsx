interface CryToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  isToday?: boolean
}

export function CryToggle({ value, onChange, isToday = true }: CryToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      className={`cry-row${value ? ' is-on' : ''}`}
      onClick={() => onChange(!value)}
    >
      <span className="cry-emoji" aria-hidden>
        🥲
      </span>
      <span className="cry-copy">
        <span className="cry-title">
          {isToday ? 'Плакала сегодня' : 'Плакала в этот день'}
        </span>
        <span className="cry-hint">{value ? 'сегодня были слёзы' : 'если день был со слезами'}</span>
      </span>
      <span className={`switch${value ? ' is-on' : ''}`} aria-hidden />
    </button>
  )
}
