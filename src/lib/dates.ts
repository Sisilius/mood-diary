import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { HISTORY_MONTHS } from '../config'

export const toKey = (date: Date): string => format(date, 'yyyy-MM-dd')

export const fromKey = (key: string): Date => parseISO(key)

export const todayKey = (): string => toKey(new Date())

export const shiftKey = (key: string, days: number): string =>
  toKey(addDays(fromKey(key), days))

export const capitalize = (value: string): string =>
  value.length === 0 ? value : value[0].toUpperCase() + value.slice(1)

export const formatDayTitle = (key: string): string =>
  capitalize(format(fromKey(key), 'EEEE, d MMMM', { locale: ru }))

export const formatMonthTitle = (date: Date): string =>
  capitalize(format(date, 'LLLL yyyy', { locale: ru }))

export const formatShort = (key: string): string =>
  format(fromKey(key), 'd MMM', { locale: ru })

/** Самая ранняя доступная дата (начало месяца N месяцев назад). */
export const minDayKey = (): string =>
  toKey(startOfMonth(subMonths(new Date(), HISTORY_MONTHS - 1)))

export const minMonth = (): Date => startOfMonth(subMonths(new Date(), HISTORY_MONTHS - 1))

export const maxMonth = (): Date => startOfMonth(new Date())

export const isFutureKey = (key: string): boolean =>
  isAfter(startOfDay(fromKey(key)), startOfDay(new Date()))

export const isSameMonthKey = (key: string, month: Date): boolean =>
  isSameMonth(fromKey(key), month)

/** Сетка месяца с понедельника по воскресенье, включая дни соседних месяцев. */
export const monthGrid = (month: Date): Date[] =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

export const shiftMonth = (month: Date, delta: number): Date => addMonths(month, delta)

export const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'] as const
