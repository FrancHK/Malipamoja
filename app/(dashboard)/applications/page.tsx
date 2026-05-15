import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Header } from '@/components/layout/Header'
import { ApplicationsClient } from '@/components/applications/ApplicationsClient'
import type { MemberApplication } from '@/lib/types'

export const metadata: Metadata = { title: 'Maombi ya Kujiunga' }

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['mwenyekiti', 'katibu', 'msimamizi'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const admin = createAdminClient()
  const { data: applications } = await admin
    .from('member_applications')
    .select('*, group:groups(name)')
    .order('created_at', { ascending: false })

  const pending = (applications ?? []).filter(a => a.status === 'pending')
  const done = (applications ?? []).filter(a => a.status !== 'pending')

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Maombi ya Kujiunga"
        subtitle={`${pending.length} ombi zinasubiri idhini`}
        user={{ full_name: profile.full_name, email: user.email }}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <ApplicationsClient
          pending={pending as MemberApplication[]}
          done={done as MemberApplication[]}
        />
      </div>
    </div>
  )
}
