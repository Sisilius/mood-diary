import { IconChart, IconHeart } from './Icons'
import type { Tab } from '../types'

interface TabBarProps {
  tab: Tab
  onChange: (tab: Tab) => void
}

export function TabBar({ tab, onChange }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Разделы">
      <button
        type="button"
        className={tab === 'day' ? 'is-active' : undefined}
        aria-current={tab === 'day' ? 'page' : undefined}
        onClick={() => onChange('day')}
      >
        <IconHeart size={18} />
        День
      </button>
      <button
        type="button"
        className={tab === 'stats' ? 'is-active' : undefined}
        aria-current={tab === 'stats' ? 'page' : undefined}
        onClick={() => onChange('stats')}
      >
        <IconChart size={18} />
        Статистика
      </button>
    </nav>
  )
}
