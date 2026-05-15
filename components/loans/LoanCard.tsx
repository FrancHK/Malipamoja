import { Avatar } from '@/components/ui/Avatar'
import { loanStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, getLoanProgress } from '@/lib/utils'
import type { Loan } from '@/lib/types'
import { Calendar, Target } from 'lucide-react'

interface LoanCardProps {
  loan: Loan
  canApprove?: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onRepay?: (id: string) => void
}

export function LoanCard({ loan, canApprove, onApprove, onReject, onRepay }: LoanCardProps) {
  const borrowerName = loan.borrower?.full_name ?? 'Mkopaji'
  const progress = getLoanProgress(loan.amount_paid, loan.total_due)
  const remaining = loan.total_due - loan.amount_paid

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={borrowerName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{borrowerName}</p>
          <p className="text-xs text-slate-500 truncate">{loan.purpose ?? 'Sababu haikutajwa'}</p>
        </div>
        {loanStatusBadge(loan.status)}
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-xs text-slate-500 mb-1">Mkopo</p>
          <p className="text-sm font-bold text-white">{formatCurrency(loan.amount)}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-xs text-slate-500 mb-1">Jumla</p>
          <p className="text-sm font-bold text-amber-400">{formatCurrency(loan.total_due)}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-2.5 text-center">
          <p className="text-xs text-slate-500 mb-1">Baki</p>
          <p className="text-sm font-bold text-red-400">{formatCurrency(remaining)}</p>
        </div>
      </div>

      {/* Progress */}
      {loan.status === 'active' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Target className="w-3 h-3" /> Maendeleo</span>
            <span className="text-xs font-medium text-emerald-400">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 pt-3">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(loan.requested_at)}</span>
        {loan.due_date && <span>Mwisho: {formatDate(loan.due_date)}</span>}
        <span>Riba {loan.interest_rate}% × {loan.duration_months}m</span>
      </div>

      {/* Actions */}
      {(canApprove && loan.status === 'pending') && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => onReject?.(loan.id)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Kataa
          </button>
          <button
            onClick={() => onApprove?.(loan.id)}
            className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            Idhinisha
          </button>
        </div>
      )}

      {(loan.status === 'active' && onRepay) && (
        <div className="mt-3 pt-3 border-t border-slate-800/60">
          <button
            onClick={() => onRepay(loan.id)}
            className="w-full py-1.5 text-xs font-medium rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
          >
            Rekodi Malipo
          </button>
        </div>
      )}
    </div>
  )
}
