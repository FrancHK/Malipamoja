'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Users, PiggyBank, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_NAV = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vikundi', href: '/groups', icon: Wallet },
  { label: 'Wanachama', href: '/members', icon: Users },
  { label: 'Michango', href: '/contributions', icon: PiggyBank },
  { label: 'Mikopo', href: '/loans', icon: CreditCard },
]

export function MobileNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/60">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150',
              isActive(href) ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
