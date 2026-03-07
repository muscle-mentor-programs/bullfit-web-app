import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/food-corrections/[id] — admin approves or rejects a correction
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const { action } = await req.json()
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
  }

  // Fetch the correction
  const { data: correction, error: fetchError } = await supabase
    .from('food_corrections')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !correction) {
    return NextResponse.json({ error: 'Correction not found' }, { status: 404 })
  }

  // Update correction status
  const { error: updateError } = await supabase
    .from('food_corrections')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // On approve: upsert food_overrides with the corrected data
  if (action === 'approve') {
    const { error: overrideError } = await supabase
      .from('food_overrides')
      .upsert({
        food_id: correction.food_id,
        food_name: correction.corrected_name,
        brand_name: correction.corrected_brand ?? null,
        serving_size: correction.corrected_serving_size ?? null,
        serving_size_unit: correction.corrected_serving_unit ?? null,
        calories: correction.corrected_calories,
        protein_g: correction.corrected_protein_g,
        carbs_g: correction.corrected_carbs_g,
        fat_g: correction.corrected_fat_g,
        approved_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'food_id' })

    if (overrideError) return NextResponse.json({ error: overrideError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, action })
}
