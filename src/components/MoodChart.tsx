import { addDays, format } from 'date-fns'
import { toKey } from '../lib/dates'
import { getMood } from '../lib/moods'
import type { Entry } from '../types'

interface MoodChartProps {
  entries: Map<string, Entry>
  days: number
}

const WIDTH = 340
const HEIGHT = 172
const PAD = { top: 12, right: 8, bottom: 24, left: 34 }
const INNER_W = WIDTH - PAD.left - PAD.right
const INNER_H = HEIGHT - PAD.top - PAD.bottom
/** Если между записями больше недели — рисуем новый отрезок. */
const MAX_GAP_DAYS = 7

interface Point {
  x: number
  y: number
  index: number
}

export function MoodChart({ entries, days }: MoodChartProps) {
  const today = new Date()
  const cells = Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - (days - 1))
    return { index, key: toKey(date), mood: entries.get(toKey(date))?.mood ?? null }
  })

  const xFor = (index: number) =>
    PAD.left + (days <= 1 ? INNER_W / 2 : (index / (days - 1)) * INNER_W)
  const yFor = (mood: number) => PAD.top + ((5 - mood) / 4) * INNER_H

  const points: Point[] = cells
    .filter((cell) => cell.mood !== null)
    .map((cell) => ({
      index: cell.index,
      x: xFor(cell.index),
      y: yFor(cell.mood as number),
    }))

  const segments: Point[][] = []
  let segment: Point[] = []
  let previousIndex: number | null = null

  for (const point of points) {
    if (previousIndex !== null && point.index - previousIndex > MAX_GAP_DAYS) {
      if (segment.length > 0) segments.push(segment)
      segment = []
    }
    segment.push(point)
    previousIndex = point.index
  }
  if (segment.length > 0) segments.push(segment)

  const tickIndexes = Array.from(new Set([0, Math.floor((days - 1) / 2), days - 1]))

  if (points.length === 0) {
    return (
      <div className="chart chart--empty">
        <span className="chart-empty-emoji" aria-hidden>
          🌱
        </span>
        <p>За этот период пока нет записей. Отметь настроение — и здесь появится график.</p>
      </div>
    )
  }

  return (
    <div className="chart">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`График настроения за последние ${days} дней`}
      >
        <defs>
          <linearGradient id="mood-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e79aa8" />
            <stop offset="100%" stopColor="#b9a4d8" />
          </linearGradient>
        </defs>

        {[1, 2, 3, 4, 5].map((level) => (
          <g key={level}>
            <line
              className="chart-grid-line"
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yFor(level)}
              y2={yFor(level)}
            />
            <text className="chart-emoji" x={PAD.left - 8} y={yFor(level) + 4} textAnchor="end">
              {getMood(level)?.emoji}
            </text>
          </g>
        ))}

        {segments.map((group, index) =>
          group.length > 1 ? (
            <path
              key={`line-${index}`}
              className="chart-line"
              d={group.map((point, i) => `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')}
            />
          ) : null,
        )}

        {points.map((point) => (
          <circle key={point.index} className="chart-dot" cx={point.x} cy={point.y} r={3.1} />
        ))}

        {tickIndexes.map((index) => {
          const date = addDays(today, index - (days - 1))
          return (
            <text
              key={`tick-${index}`}
              className="chart-tick"
              x={xFor(index)}
              y={HEIGHT - 5}
              textAnchor={index === 0 ? 'start' : index === days - 1 ? 'end' : 'middle'}
            >
              {format(date, 'd.MM')}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
