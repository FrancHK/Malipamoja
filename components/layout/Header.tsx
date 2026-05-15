'use client'

import { Bell, Search, Plus } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

interface HeaderProps {
  user?: { full_name: string; email?: string } | null
  title?: string
  subtitle?: string
  action?: { label: string; onClick: () => void; icon?: React.ReactNode }
}

export function Header({ user, title, subtitle, action }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/60 sticky top-0 z-30">
      {/* Left: Title */}
      <div>
        {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`hidden md:flex items-center gap-2 bg-slate-800 border ${searchFocused ? 'border-emerald-500/50' : 'border-slate-700'} rounded-xl px-3 py-2 transition-all duration-150`}>
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tafuta..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm text-white placeholder:text-slate-500 w-40 focus:w-56 transition-all duration-200 outline-none"
          />
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        {/* CTA action */}
        {action && (
          <Button size="sm" onClick={action.onClick} className="hidden sm:inline-flex">
            {action.icon ?? <Plus className="w-4 h-4" />}
            {action.label}
          </Button>
        )}

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <Avatar name={user.full_name} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-none">{user.full_name}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-none">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
