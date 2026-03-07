import { redirect } from 'next/navigation'

// BULLFIT uses /programs — no separate marketplace
export default function MarketplacePage() {
  redirect('/programs')
}
