import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface OFFNutriments {
  'energy-kcal_serving'?: number
  'energy-kcal_100g'?: number
  proteins_serving?: number
  proteins_100g?: number
  carbohydrates_serving?: number
  carbohydrates_100g?: number
  fat_serving?: number
  fat_100g?: number
}

interface OFFProduct {
  product_name?: string
  brands?: string
  nutriments?: OFFNutriments
  serving_size?: string
  serving_quantity?: number
}

interface OFFResponse {
  status: number
  product?: OFFProduct
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await params

  if (!code || !/^\d{6,14}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid barcode' }, { status: 400 })
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,serving_size,serving_quantity`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BULLFIT/1.0 (nutrition logging app)' },
      next: { revalidate: 86400 }, // cache 24h
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const data: OFFResponse = await res.json()

    if (data.status !== 1 || !data.product?.product_name) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = data.product
    const n = product.nutriments ?? {}
    const qty = product.serving_quantity ?? 100

    function perServing(kcalKey: keyof OFFNutriments, per100Key: keyof OFFNutriments): number {
      const sv = n[kcalKey]
      if (sv != null) return sv as number
      const p100 = n[per100Key]
      if (p100 != null) return (p100 as number) * qty / 100
      return 0
    }

    const food = {
      fdcId: code,
      description: product.product_name,
      brandName: product.brands?.split(',')[0].trim() || undefined,
      servingSize: qty,
      servingSizeUnit: 'g',
      calories: Math.round(perServing('energy-kcal_serving', 'energy-kcal_100g')),
      protein_g: Math.round(perServing('proteins_serving', 'proteins_100g') * 10) / 10,
      carbs_g: Math.round(perServing('carbohydrates_serving', 'carbohydrates_100g') * 10) / 10,
      fat_g: Math.round(perServing('fat_serving', 'fat_100g') * 10) / 10,
    }

    return NextResponse.json(food)
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
