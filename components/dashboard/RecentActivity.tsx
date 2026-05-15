import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import type { Transaction } from '@/lib/types'
import { ArrowDownLeft, ArrowUpRight, Banknote, TrendingUp } from 'lucide-react'

const TYPE_CONFIG = {
  contribution:      { label: 'Mchango',     icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  loan_disbursement: { label: 'Mkopo',        icon: ArrowUpRight,  color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  repayment:         { label: 'Malipo',        icon: TrendingUp,    color: 'text-sky-400',     bg: 'bg-sky-500/10'     },
  withdrawal:        { label: 'Uondoaji',      icon: Banknote,      color: 'text-red-400',     bg: 'bg-red-500/10'     },
  fine:              { label: 'Faini',         icon: Banknote,      color: 'text-orange-400',  bg: 'bg-orange-500/10'  },
}

interface RecentActivityProps {
  transactions: Transaction[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl">
      <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
        <h3 className="font-semibold text-white">Shughuli za Hivi Karibuni</h3>
        <span className="text-xs text-slate-500 bg-slate-800 rounded-lg px-2.5 py-1">{transactions.length} shughuli</span>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Hakuna shughuli bado</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {transactions.map((tx) => {
            const config = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.contribution
            const Icon = config.icon
            const memberName = tx.member?.full_name ?? 'Mwanachama'
            return (
              <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <Avatar name={memberName} size="xs" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description ?? config.label}</p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(tx.created_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${config.color}`}>
                    {tx.type === 'loan_disbursement' || tx.type === 'withdrawal' ? '−' : '+'}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-500">{config.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
