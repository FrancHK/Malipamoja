import { redirect } from 'next/navigation'
import { getSessionUser, getProfile } from '@/lib/auth/session'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { UserProvider } from '@/components/providers/UserProvider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  const userInfo = {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name ?? user.email?.split('@')[0] ?? 'Mtumiaji',
  }

  return (
    <UserProvider user={userInfo}>
      <div className="flex h-screen overflow-hidden bg-[#080815]">
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </UserProvider>
  )
}
