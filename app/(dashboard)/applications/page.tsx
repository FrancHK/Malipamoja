import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser, getProfile } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { Header } from '@/components/layout/Header'
import { ApplicationsClient } from '@/components/applications/ApplicationsClient'
import type { MemberApplication } from '@/lib/types'

export const metadata: Metadata = { title: 'Maombi ya Kujiunga' }

export default async function ApplicationsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile || !['mwenyekiti', 'katibu', 'msimamizi'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const applications = (await sql`
    select a.*,
           case when g.id is null then null else json_build_object('name', g.name) end as group
    from member_applications a
    left join groups g on g.id = a.group_id
    order by a.created_at desc
  `) as MemberApplication[]

  const pending = applications.filter((a) => a.status === 'pending')
  const done = applications.filter((a) => a.status !== 'pending')

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
