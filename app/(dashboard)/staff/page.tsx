import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { StaffClient } from '@/components/staff/StaffClient'

export const metadata: Metadata = { title: 'Wafanyakazi' }

const ROLE_LABELS: Record<string, string> = {
  mwenyekiti:  'Mwenyekiti',
  katibu:      'Katibu',
  mweka_hazina:'Mweka Hazina',
  msimamizi:   'Msimamizi',
}

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'mwenyekiti') redirect('/dashboard')

  const { data: staffList } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, created_at')
    .in('role', ['mwenyekiti', 'katibu', 'mweka_hazina', 'msimamizi'])
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Wafanyakazi"
        subtitle="Simamia timu yako ya uongozi"
        user={{ full_name: profile.full_name, email: user.email }}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <StaffClient staff={staffList ?? []} roleLabels={ROLE_LABELS} />
      </div>
    </div>
  )
}
