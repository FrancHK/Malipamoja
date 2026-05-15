'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, PiggyBank, CreditCard,
  BarChart3, Bell, Settings, LogOut, ChevronRight, Wallet, ClipboardList, UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Vikundi', href: '/groups', icon: Wallet },
  { label: 'Wanachama', href: '/members', icon: Users },
  { label: 'Michango', href: '/contributions', icon: PiggyBank },
  { label: 'Mikopo', href: '/loans', icon: CreditCard },
  { label: 'Maombi', href: '/applications', icon: ClipboardList },
  { label: 'Wafanyakazi', href: '/staff', icon: UserPlus },
  { label: 'Ripoti', href: '/reports', icon: BarChart3 },
]

const BOTTOM_ITEMS = [
  { label: 'Arifa', href: '/notifications', icon: Bell },
  { label: 'Mipangilio', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside className="flex flex-col w-64 bg-slate-900 border-r border-slate-800/60 h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-white font-bold text-base">M</span>
        </div>
        <div>
          <p className="font-bold text-white text-base leading-none">MaliPamoja</p>
          <p className="text-xs text-slate-500 mt-0.5">VICOBA Digital</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menyu Kuu</p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
              isActive(href)
                ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-[10px]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            )}
          >
            <Icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive(href) ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300')} size={18} />
            <span className="flex-1">{label}</span>
            {isActive(href) && <ChevronRight className="w-3.5 h-3.5 text-emerald-500/60" />}
          </Link>
        ))}

        <div className="pt-4">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Zaidi</p>
          {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive(href)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0 text-slate-500 group-hover:text-slate-300" size={18} />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 cursor-pointer"
          >
            <LogOut size={18} className="flex-shrink-0" />
            Toka
          </button>
        </form>
      </div>
    </aside>
  )
}
