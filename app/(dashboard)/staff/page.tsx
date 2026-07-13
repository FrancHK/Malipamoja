import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser, getProfile } from '@/lib/auth/session'
import { sql } from '@/lib/db'
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
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || profile.role !== 'mwenyekiti') redirect('/dashboard')

  const staffList = (await sql`
    select id, full_name, phone, role, created_at
    from profiles
    where role in ('mwenyekiti', 'katibu', 'mweka_hazina', 'msimamizi')
    order by created_at asc
  `) as { id: string; full_name: string; phone: string | null; role: string; created_at: string }[]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Wafanyakazi"
        subtitle="Simamia timu yako ya uongozi"
        user={{ full_name: profile.full_name, email: user.email }}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <StaffClient staff={staffList} roleLabels={ROLE_LABELS} />
      </div>
    </div>
  )
}
