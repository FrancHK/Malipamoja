import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const { data, error } = await supabase
    .from('member_applications')
    .select('*, group:groups(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { full_name, phone, id_number, occupation, reason, group_id } = body

  if (!full_name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Jina na simu zinahitajika' }, { status: 400 })
  }

  // Use admin client so that anon users can submit without Supabase auth
  const admin = createAdminClient()
  const { error } = await admin.from('member_applications').insert({
    full_name: full_name.trim(),
    phone: phone.trim(),
    id_number: id_number?.trim() || null,
    occupation: occupation?.trim() || null,
    reason: reason?.trim() || null,
    group_id: group_id || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
