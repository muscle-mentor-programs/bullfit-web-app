import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/food-override?food_id=X
export async function GET(req: NextRequest) {
  const foodId = req.nextUrl.searchParams.get('food_id')
  if (!foodId) return NextResponse.json(null)

  const supabase = await createClient()
  const { data } = await supabase
    .from('food_overrides')
    .select('*')
    .eq('food_id', foodId)
    .maybeSingle()

  return NextResponse.json(data ?? null)
}

// PUT /api/food-override — admin creates or updates an override
export async function PUT(req: NextRequest) {
  const supabase = await createClient()

  // Verify admin
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

  const body = await req.json()
  const {
    food_id, food_name, brand_name,
    serving_size, serving_size_unit,
    calories, protein_g, carbs_g, fat_g,
  } = body

  if (!food_id || !food_name || calories == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('food_overrides')
    .upsert({
      food_id,
      food_name,
      brand_name: brand_name ?? null,
      serving_size: serving_size ?? null,
      serving_size_unit: serving_size_unit ?? null,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      approved_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'food_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
