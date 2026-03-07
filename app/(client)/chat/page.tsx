import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './ChatClient'

export default async function ChatPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  // Fetch all chat rooms the user is a member of
  const { data: memberRows } = await supabase
    .from('chat_room_members')
    .select(`
      chat_room:chat_rooms(
        id,
        type,
        name,
        program_id
      )
    `)
    .eq('user_id', authUser.id)

  const rooms = (memberRows ?? [])
    .map((r: any) => r.chat_room)
    .filter(Boolean)

  return <ChatClient rooms={rooms} userId={authUser.id} />
}
