import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/food-corrections — admin fetches all corrections
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get('status') ?? 'pending'

  const { data, error } = await supabase
    .from('food_corrections')
    .select('*, user:users(id, name, email)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/food-corrections — user submits a correction
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    food_id, original_name,
    corrected_name, corrected_brand,
    corrected_serving_size, corrected_serving_unit,
    corrected_calories, corrected_protein_g, corrected_carbs_g, corrected_fat_g,
    notes,
  } = body

  if (!food_id || !original_name || !corrected_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('food_corrections')
    .insert({
      user_id: user.id,
      food_id,
      original_name,
      corrected_name,
      corrected_brand: corrected_brand ?? null,
      corrected_serving_size: corrected_serving_size ?? null,
      corrected_serving_unit: corrected_serving_unit ?? null,
      corrected_calories,
      corrected_protein_g,
      corrected_carbs_g,
      corrected_fat_g,
      notes: notes ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
