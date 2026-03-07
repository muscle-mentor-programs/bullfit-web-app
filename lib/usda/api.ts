import type { UsdaFoodSearchResult } from '@/types'

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

interface UsdaApiNutrient {
  nutrientId: number
  nutrientName: string
  value: number
}

interface UsdaApiFood {
  fdcId: number
  description: string
  brandName?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: UsdaApiNutrient[]
}

interface UsdaSearchApiResponse {
  foods: UsdaApiFood[]
  totalHits: number
}

// Sanitize the API key — trim whitespace/newlines and fall back to DEMO_KEY
// if missing or still set to the placeholder value.
function getApiKey(): string {
  const raw = (process.env.USDA_API_KEY ?? '').trim()
  if (!raw || raw === 'placeholder' || raw === 'your-usda-key') return 'DEMO_KEY'
  return raw
}

// Calorie IDs:
//   1008 = Energy (kcal)  — used by Branded & SR Legacy
//   2047 = Energy (Atwater General) — used by Foundation
//   2048 = Energy (Atwater Specific) — used by Foundation
const CALORIE_IDS = [1008, 2047, 2048]

const NUTRIENT_IDS = {
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
}

function getNutrient(nutrients: UsdaApiNutrient[], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0
}

function getCalories(nutrients: UsdaApiNutrient[]): number {
  for (const id of CALORIE_IDS) {
    const val = getNutrient(nutrients, id)
    if (val > 0) return val
  }
  return 0
}

export function mapUsdaFood(food: UsdaApiFood): UsdaFoodSearchResult {
  return {
    fdcId: String(food.fdcId),
    description: food.description,
    brandName: food.brandName,
    servingSize: food.servingSize,
    servingSizeUnit: food.servingSizeUnit,
    calories: getCalories(food.foodNutrients),
    protein_g: getNutrient(food.foodNutrients, NUTRIENT_IDS.PROTEIN),
    carbs_g: getNutrient(food.foodNutrients, NUTRIENT_IDS.CARBS),
    fat_g: getNutrient(food.foodNutrients, NUTRIENT_IDS.FAT),
  }
}

export async function searchFoods(
  query: string,
  pageSize = 25
): Promise<UsdaFoodSearchResult[]> {
  const apiKey = getApiKey()
  const url = `${BASE_URL}/foods/search?api_key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      pageSize,
      // Only use dataTypes that reliably have calorie + macro data
      dataType: ['SR Legacy', 'Survey (FNDDS)', 'Branded'],
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`USDA API error: ${res.status} ${body.slice(0, 200)}`)
  }

  const data: UsdaSearchApiResponse = await res.json()
  return (data.foods ?? []).map(mapUsdaFood)
}

export async function getFoodById(fdcId: string): Promise<UsdaFoodSearchResult | null> {
  const apiKey = getApiKey()
  const url = `${BASE_URL}/food/${fdcId}?api_key=${apiKey}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const food: UsdaApiFood = await res.json()
  return mapUsdaFood(food)
}
