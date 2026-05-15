import Link from 'next/link'
import { Users, TrendingUp, CreditCard, ChevronRight, Calendar, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { roleBadge } from '@/components/ui/Badge'
import type { Group } from '@/lib/types'

interface GroupCardProps {
  group: Group
  onEdit?: (group: Group) => void
}

export function GroupCard({ group, onEdit }: GroupCardProps) {
  const canEdit = group.my_role === 'admin' && onEdit

  return (
    <div className="relative group/card">
      <Link href={`/groups/${group.id}`} className="block group">
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-semibold text-white text-base group-hover:text-emerald-400 transition-colors truncate pr-6">{group.name}</h3>
              {group.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{group.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {group.my_role && roleBadge(group.my_role)}
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Users className="w-4 h-4 text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{group.member_count ?? 0}</p>
              <p className="text-[10px] text-slate-500">Wanachama</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{formatCurrency(group.total_savings ?? 0)}</p>
              <p className="text-[10px] text-slate-500">Akiba</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <CreditCard className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{group.active_loans ?? 0}</p>
              <p className="text-[10px] text-slate-500">Mikopo</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Mchango: {formatCurrency(group.contribution_amount)} / {group.contribution_cycle === 'weekly' ? 'wiki' : 'mwezi'}</span>
            </div>
            <span className="text-slate-600">Riba {group.interest_rate}%</span>
          </div>
        </div>
      </Link>

      {/* Edit button — floats top-right, only for admins */}
      {canEdit && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onEdit(group) }}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/40 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all"
          title="Hariri kundi"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
        </button>
      )}
    </div>
  )
}
