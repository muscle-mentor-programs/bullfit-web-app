import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'musclementorprograms@gmail.com'
const ADMIN_PASSWORD = 'ChangeMe123!'
const ADMIN_NAME = 'Admin'

/**
 * POST /api/admin/setup-user
 *
 * One-time endpoint to create/update the admin account with email+password.
 * Protected by ADMIN_SETUP_KEY env var.
 *
 * Call once after deploy:
 *   curl -X POST https://your-domain/api/admin/setup-user \
 *     -H "x-setup-key: <ADMIN_SETUP_KEY>"
 */
export async function POST(request: Request) {
  const key = request.headers.get('x-setup-key')
  const expectedKey = process.env.ADMIN_SETUP_KEY ?? 'bullfit-setup-2024'

  if (key !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = await createAdminClient()

    // List users to find existing admin
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = users?.find((u) => u.email === ADMIN_EMAIL)

    let userId: string

    if (existing) {
      // Update password + confirm email
      const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
      if (error) throw error
      userId = existing.id
      console.log('[setup-user] Updated existing user:', userId)
    } else {
      // Create new user
      const { data, error } = await admin.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { name: ADMIN_NAME },
      })
      if (error) throw error
      userId = data.user!.id
      console.log('[setup-user] Created new user:', userId)
    }

    // Upsert admin role in public.users
    const { error: upsertError } = await admin.from('users').upsert(
      {
        id: userId,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
      },
      { onConflict: 'id' }
    )
    if (upsertError) throw upsertError

    return NextResponse.json({
      success: true,
      userId,
      action: existing ? 'updated' : 'created',
    })
  } catch (err) {
    console.error('[setup-user] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
