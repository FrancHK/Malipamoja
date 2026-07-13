import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { generateCode, deriveMemberPassword, memberEmail } from '@/lib/member-code'
import { sendApprovalSMS } from '@/lib/sms'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { action, rejection_reason } = body as { action: 'approve' | 'reject'; rejection_reason?: string }

  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const mine = await sql`select role from profiles where id = ${user.id} limit 1`
  if (!mine[0] || !['mwenyekiti', 'katibu', 'msimamizi'].includes(mine[0].role as string)) {
    return NextResponse.json({ error: 'Huna ruhusa ya kufanya hili' }, { status: 403 })
  }

  const apps = await sql`select * from member_applications where id = ${id} limit 1`
  const application = apps[0]
  if (!application) return NextResponse.json({ error: 'Ombi halipatikani' }, { status: 404 })
  if (application.status !== 'pending') {
    return NextResponse.json({ error: 'Ombi hili tayari limefanyiwa maamuzi' }, { status: 400 })
  }

  if (action === 'reject') {
    await sql`
      update member_applications set
        status = 'rejected', reviewed_by = ${user.id}, reviewed_at = now(),
        rejection_reason = ${rejection_reason || null}
      where id = ${id}
    `
    return NextResponse.json({ success: true, action: 'rejected' })
  }

  // ── APPROVE ───────────────────────────────────────────────────────────────

  // Sequential member code, incremented on collision
  const countRows = await sql`select count(*)::int as n from profiles where role = 'mwanachama'`
  let attempt = (countRows[0].n as number) + 1
  let finalCode = generateCode(application.full_name, attempt)
  while (true) {
    const existing = await sql`select id from profiles where member_code = ${finalCode} limit 1`
    if (!existing[0]) break
    attempt++
    finalCode = generateCode(application.full_name, attempt)
  }

  const email = memberEmail(finalCode)
  const password = deriveMemberPassword(finalCode)

  // Create the Neon Auth user for the member
  const { data, error: createError } = await auth.admin.createUser({
    email,
    password,
    name: application.full_name,
  })
  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }
  const memberId = data?.user?.id
  if (!memberId) {
    return NextResponse.json({ error: 'Imeshindwa kuunda mtumiaji' }, { status: 500 })
  }

  // Upsert profile with member_code + role
  await sql`
    insert into profiles (id, full_name, phone, role, member_code)
    values (${memberId}, ${application.full_name}, ${application.phone}, 'mwanachama', ${finalCode})
    on conflict (id) do update
      set full_name = excluded.full_name, phone = excluded.phone,
          role = excluded.role, member_code = excluded.member_code
  `

  // Add member to their group if one was specified
  if (application.group_id) {
    await sql`
      insert into group_members (group_id, user_id, role)
      values (${application.group_id}, ${memberId}, 'member')
    `
  }

  // Update application
  await sql`
    update member_applications set
      status = 'approved', reviewed_by = ${user.id}, reviewed_at = now(), member_code = ${finalCode}
    where id = ${id}
  `

  // Send SMS (non-blocking — log error but don't fail the request)
  try {
    await sendApprovalSMS(application.phone, application.full_name, finalCode)
  } catch (e) {
    console.error('SMS send failed:', e)
  }

  return NextResponse.json({
    success: true,
    action: 'approved',
    member_code: finalCode,
    member_id: memberId,
  })
}
