import { redirect } from 'next/navigation'

export default function AdminSubscribersRedirect() {
  redirect('/admin/users')
}
