import { Phone, TrendingUp, AlertCircle, Hash } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { roleBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import type { GroupMember } from '@/lib/types'

interface MemberCardProps {
  member: GroupMember
}

export function MemberCard({ member }: MemberCardProps) {
  const name = member.profile?.full_name ?? 'Mwanachama'
  const hasPending = (member.pending_contributions ?? 0) > 0

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200">
      {/* Top */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{name}</p>
          {member.profile?.phone && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3" />
              {member.profile.phone}
            </p>
          )}
          {(member.profile as { member_code?: string })?.member_code && (
            <p className="text-xs text-emerald-500/70 flex items-center gap-1 mt-0.5 font-mono">
              <Hash className="w-3 h-3" />
              {(member.profile as { member_code?: string }).member_code}
            </p>
          )}
        </div>
        {roleBadge(member.role)}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-slate-800/40 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Michango Yote
          </div>
          <span className="text-sm font-semibold text-emerald-400">{formatCurrency(member.total_contributions ?? 0)}</span>
        </div>

        {hasPending && (
          <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Inasubiri
            </div>
            <span className="text-sm font-semibold text-amber-400">{formatCurrency(member.pending_contributions!)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
