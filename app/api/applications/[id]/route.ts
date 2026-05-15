import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateCode, deriveMemberPassword, memberEmail } from '@/lib/member-code'
import { sendApprovalSMS } from '@/lib/sms'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { action, rejection_reason } = body as { action: 'approve' | 'reject'; rejection_reason?: string }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['mwenyekiti', 'katibu', 'msimamizi'].includes(profile.role)) {
    return NextResponse.json({ error: 'Huna ruhusa ya kufanya hili' }, { status: 403 })
  }

  const adminClient = createAdminClient()

  const { data: application } = await adminClient
    .from('member_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!application) return NextResponse.json({ error: 'Ombi halipatikani' }, { status: 404 })
  if (application.status !== 'pending') {
    return NextResponse.json({ error: 'Ombi hili tayari limefanyiwa maamuzi' }, { status: 400 })
  }

  if (action === 'reject') {
    await adminClient.from('member_applications').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejection_reason || null,
    }).eq('id', id)

    return NextResponse.json({ success: true, action: 'rejected' })
  }

  // ── APPROVE ───────────────────────────────────────────────────────────────

  // Count existing members to generate sequential code
  const { count } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'mwanachama')

  const sequence = (count ?? 0) + 1
  const code = generateCode(application.full_name, sequence)

  // Check code uniqueness — increment if collision
  let finalCode = code
  let attempt = sequence
  while (true) {
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id')
      .eq('member_code', finalCode)
      .maybeSingle()
    if (!existing) break
    attempt++
    finalCode = generateCode(application.full_name, attempt)
  }

  const email = memberEmail(finalCode)
  const password = deriveMemberPassword(finalCode)

  // Create Supabase auth user for the member
  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: application.full_name,
      phone: application.phone,
      role: 'mwanachama',
      member_code: finalCode,
    },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  const memberId = newUser.user!.id

  // Upsert profile with member_code — trigger may have already created a partial row
  await adminClient.from('profiles').upsert({
    id: memberId,
    full_name: application.full_name,
    phone: application.phone,
    role: 'mwanachama',
    member_code: finalCode,
  }, { onConflict: 'id' })

  // Add member to their group if one was specified
  if (application.group_id) {
    await adminClient.from('group_members').insert({
      group_id: application.group_id,
      user_id: memberId,
      role: 'member',
    })
  }

  // Update application
  await adminClient.from('member_applications').update({
    status: 'approved',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    member_code: finalCode,
  }).eq('id', id)

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
