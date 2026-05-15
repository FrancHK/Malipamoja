import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: { value: string; positive: boolean }
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  suffix?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-emerald-400', iconBg = 'bg-emerald-500/10' }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/80 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-2 count-up">{value}</p>
          {change && (
            <p className={cn('text-xs font-medium mt-1.5 flex items-center gap-1', change.positive ? 'text-emerald-400' : 'text-red-400')}>
              <span>{change.positive ? '↑' : '↓'}</span>
              <span>{change.value}</span>
              <span className="text-slate-500 font-normal">mwezi huu</span>
            </p>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
    </div>
  )
}
