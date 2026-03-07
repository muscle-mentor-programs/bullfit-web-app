import { searchFoods } from '@/lib/usda/api'
import { createClient } from '@/lib/supabase/server'
import type { UsdaFoodSearchResult } from '@/types'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json([], { status: 200 })

  try {
    const foods = await searchFoods(q, 30)

    // Check if any results have admin-verified overrides
    if (foods.length > 0) {
      try {
        const supabase = await createClient()
        const foodIds = foods.map((f) => f.fdcId)
        const { data: overrides } = await supabase
          .from('food_overrides')
          .select('*')
          .in('food_id', foodIds)

        if (overrides && overrides.length > 0) {
          const overrideMap = new Map(overrides.map((o) => [o.food_id, o]))
          const merged: UsdaFoodSearchResult[] = foods.map((food) => {
            const override = overrideMap.get(food.fdcId)
            if (!override) return food
            return {
              fdcId: food.fdcId,
              description: override.food_name,
              brandName: override.brand_name ?? food.brandName,
              servingSize: override.serving_size ?? food.servingSize,
              servingSizeUnit: override.serving_size_unit ?? food.servingSizeUnit,
              calories: override.calories,
              protein_g: override.protein_g,
              carbs_g: override.carbs_g,
              fat_g: override.fat_g,
              verified: true,
            }
          })
          return NextResponse.json(merged)
        }
      } catch {
        // If override check fails, still return the USDA results
      }
    }

    return NextResponse.json(foods)
  } catch (err) {
    console.error('[USDA search]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
