import { auth } from './server'
import { sql } from '@/lib/db'
import type { Profile } from '@/lib/types'

export interface SessionUser {
  id: string
  email: string
  name?: string | null
}

// Current authenticated Neon Auth user, or null. Full validation (network) —
// use this in layouts / route handlers, not in proxy.ts.
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const { data: session } = await auth.getSession()
    const user = session?.user
    if (!user) return null
    return { id: user.id, email: user.email ?? '', name: user.name }
  } catch {
    // Auth backend unreachable / not configured — treat as logged out.
    return null
  }
}

// The app-specific profile row for a given user id.
export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = (await sql`
    select * from profiles where id = ${userId}
  `) as Profile[]
  return rows[0] ?? null
}
