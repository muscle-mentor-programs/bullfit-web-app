import { addDays } from 'date-fns'

/**
 * Generates user_sessions rows for every session in a program,
 * starting from the Monday of the week containing startDate.
 *
 * Used by:
 * - POST /api/programs/[id]/enroll  (subscriber adds program to calendar)
 * - Stripe webhook (legacy compatibility)
 */
export async function scheduleProgram(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  programId: string,
  startDate: string,
): Promise<void> {
  const { data: weeks } = await supabase
    .from('program_weeks')
    .select('*, program_sessions(*)')
    .eq('program_id', programId)
    .order('week_number')

  if (!weeks?.length) return

  // Normalize startDate to Monday of that week
  const programStart = new Date(startDate)
  const dayOfWeek = programStart.getDay() // 0=Sun
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const mondayOfStartWeek = addDays(programStart, daysToMonday)

  const sessionRows: {
    user_id: string
    program_session_id: string
    scheduled_date: string
  }[] = []

  for (const week of weeks) {
    const weekOffset = (week.week_number - 1) * 7
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const session of (week as any).program_sessions ?? []) {
      // day_of_week: 1=Mon … 7=Sun
      const dayOffset = session.day_of_week - 1
      const scheduledDate = addDays(mondayOfStartWeek, weekOffset + dayOffset)
      sessionRows.push({
        user_id: userId,
        program_session_id: session.id,
        scheduled_date: scheduledDate.toISOString().slice(0, 10),
      })
    }
  }

  if (sessionRows.length > 0) {
    await supabase.from('user_sessions').insert(sessionRows)
  }
}
