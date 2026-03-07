import { redirect } from 'next/navigation'

// BULLFIT community — redirect to dashboard for now
export default function ChatPage() {
  redirect('/dashboard')
}
