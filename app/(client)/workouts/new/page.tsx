import { redirect } from 'next/navigation'

// BULLFIT uses program-based training — redirect to programs
export default function NewWorkoutPage() {
  redirect('/programs')
}
