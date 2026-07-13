import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { SettingsClient } from '@/components/settings/SettingsClient'
import { getSessionUser, getProfile } from '@/lib/auth/session'

export const metadata: Metadata = { title: 'Mipangilio' }

export default async function SettingsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/dashboard')

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Mipangilio"
        subtitle="Simamia akaunti na wasifu wako"
        user={{ full_name: profile.full_name, email: user.email }}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <SettingsClient profile={profile} email={user.email} />
      </div>
    </div>
  )
}
