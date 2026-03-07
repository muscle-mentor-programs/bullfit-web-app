import { redirect } from 'next/navigation'

// Root route — send unauthenticated users to login
export default function RootPage() {
  redirect('/login')
}
