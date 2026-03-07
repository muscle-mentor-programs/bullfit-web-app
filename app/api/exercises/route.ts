import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/exercises — list non-archived exercises (authenticated clients)
// Query params: ?q=bench&muscle=Chest&equipment=Barbell
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const muscle = searchParams.get('muscle') ?? ''
  const equipment = searchParams.get('equipment') ?? ''

  let query = supabase
    .from('exercises')
    .select('id, name, muscle_groups, equipment, description, youtube_url')
    .eq('is_archived', false)
    .order('name')

  // Server-side name search using ilike (much faster than client-side filter)
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Server-side filter by muscle group (array contains)
  if (muscle) {
    query = query.contains('muscle_groups', [muscle])
  }

  // Server-side filter by equipment (array contains)
  if (equipment) {
    query = query.contains('equipment', [equipment])
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ exercises: data ?? [] })
}
