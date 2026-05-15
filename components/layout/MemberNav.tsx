'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PiggyBank, CreditCard, LogOut, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/providers/UserProvider'

const NAV = [
  { label: 'Nyumbani', href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'Michango', href: '/member/contributions', icon: PiggyBank },
  { label: 'Mikopo', href: '/member/loans', icon: CreditCard },
]

export function MemberNav() {
  const pathname = usePathname()
  const user = useUser()

  return (
    <aside className="flex flex-col w-64 bg-slate-900 border-r border-slate-800/60 h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span className="text-white font-bold text-base">M</span>
        </div>
        <div>
          <p className="font-bold text-white text-base leading-none">MaliPamoja</p>
          <p className="text-xs text-slate-500 mt-0.5">Mwanachama</p>
        </div>
      </div>

      {/* Member badge */}
      {user?.member_code && (
        <div className="mx-4 mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <Hash className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Code yako</p>
            <p className="font-mono font-bold text-emerald-400 text-sm">{user.member_code}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-[10px]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <Icon size={18} className={cn('flex-shrink-0', active ? 'text-emerald-400' : 'text-slate-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut size={18} className="flex-shrink-0" />
            Toka
          </button>
        </form>
      </div>
    </aside>
  )
}
