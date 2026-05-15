import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemberNav } from '@/components/layout/MemberNav'
import { UserProvider } from '@/components/providers/UserProvider'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, member_code')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Staff wanaelekezwa kwenye dashboard yao
  if (profile.role !== 'mwanachama') redirect('/dashboard')

  const userInfo = {
    id: user.id,
    email: user.email ?? '',
    full_name: profile.full_name,
    role: profile.role,
    member_code: profile.member_code ?? '',
  }

  return (
    <UserProvider user={userInfo}>
      <div className="flex h-screen overflow-hidden bg-[#080815]">
        <div className="hidden md:flex flex-shrink-0">
          <MemberNav />
        </div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  )
}
