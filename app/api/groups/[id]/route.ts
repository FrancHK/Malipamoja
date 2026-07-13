import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const { id } = await params

    // Verify user is admin of this group
    const membership = await sql`
      select role from group_members
      where group_id = ${id} and user_id = ${user.id} and role = 'admin'
      limit 1
    `
    if (!membership[0]) {
      return NextResponse.json({ error: 'Huna ruhusa ya kubadilisha kundi hili' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, contribution_amount, contribution_cycle } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Jina la kundi linahitajika' }, { status: 400 })
    }
    if (!contribution_amount || Number(contribution_amount) < 1000) {
      return NextResponse.json({ error: 'Kiasi cha mchango lazima kiwe angalau TZS 1,000' }, { status: 400 })
    }

    const rows = await sql`
      update groups set
        name = ${name.trim()},
        description = ${description?.trim() || null},
        contribution_amount = ${Number(contribution_amount)},
        contribution_cycle = ${contribution_cycle || 'monthly'}
      where id = ${id}
      returning *
    `

    return NextResponse.json({ group: rows[0] })
  } catch (err) {
    console.error('PATCH /api/groups/[id]:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
