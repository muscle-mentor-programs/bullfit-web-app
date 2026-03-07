import { redirect } from 'next/navigation'

// BULLFIT uses /programs — no separate library page
export default function LibraryPage() {
  redirect('/programs')
}
