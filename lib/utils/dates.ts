import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  isSameDay,
  parseISO,
  isToday,
  isPast,
  isFuture,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns'
import type { ProgramSession, ProgramWeek } from '@/types'

/**
 * Given a program's weeks+sessions and a start date,
 * generate the list of { sessionId, scheduledDate } pairs.
 *
 * day_of_week: 1 = Monday, 7 = Sunday (ISO week)
 */
export function generateSessionDates(
  weeks: (ProgramWeek & { sessions: ProgramSession[] })[],
  startDate: Date
): { programSessionId: string; scheduledDate: string }[] {
  const results: { programSessionId: string; scheduledDate: string }[] = []

  // Normalize start to the Monday of that week
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })

  for (const week of weeks) {
    const weekOffset = week.week_number - 1
    const weekMonday = addWeeks(weekStart, weekOffset)

    for (const session of week.sessions) {
      // day_of_week: 1=Mon(0 offset), 7=Sun(6 offset)
      const dayOffset = session.day_of_week - 1
      const sessionDate = addDays(weekMonday, dayOffset)

      results.push({
        programSessionId: session.id,
        scheduledDate: format(sessionDate, 'yyyy-MM-dd'),
      })
    }
  }

  return results
}

export function formatDateDisplay(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d')
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'h:mm a')
}

export function isSessionToday(scheduledDate: string): boolean {
  return isToday(parseISO(scheduledDate))
}

export function isSessionPast(scheduledDate: string): boolean {
  return isPast(parseISO(scheduledDate))
}

export function isSessionFuture(scheduledDate: string): boolean {
  return isFuture(parseISO(scheduledDate))
}

export function isSameDayStr(dateStr: string, date: Date): boolean {
  return isSameDay(parseISO(dateStr), date)
}

export function getDaysInMonth(year: number, month: number): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(new Date(year, month, 1)),
    end: endOfMonth(new Date(year, month, 1)),
  })
}

export function getDayOfWeekIndex(date: Date): number {
  // Returns 0=Sun, 1=Mon, ..., 6=Sat
  return getDay(date)
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
