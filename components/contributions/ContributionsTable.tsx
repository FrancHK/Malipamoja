'use client'

import { Avatar } from '@/components/ui/Avatar'
import { contributionStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Contribution } from '@/lib/types'
import { Check, AlertCircle } from 'lucide-react'

interface ContributionsTableProps {
  contributions: Contribution[]
  canRecord?: boolean
  onMarkPaid?: (id: string) => void
}

export function ContributionsTable({ contributions, canRecord, onMarkPaid }: ContributionsTableProps) {
  if (contributions.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Hakuna michango bado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/60">
            {['Mwanachama', 'Kiasi', 'Kipindi', 'Hali', 'Tarehe ya Kulipa', 'Hatua'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {contributions.map((c) => {
            const name = c.member?.full_name ?? 'Mwanachama'
            return (
              <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-4 py-3.5 first:pl-0">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={name} size="xs" />
                    <span className="text-sm font-medium text-white">{name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(c.amount)}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-400">{formatDate(c.period_start)} – {formatDate(c.period_end)}</span>
                </td>
                <td className="px-4 py-3.5">{contributionStatusBadge(c.status)}</td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-400">{c.paid_at ? formatDate(c.paid_at) : '—'}</span>
                </td>
                <td className="px-4 py-3.5">
                  {canRecord && c.status !== 'paid' && onMarkPaid && (
                    <Button size="sm" variant="ghost" onClick={() => onMarkPaid(c.id)} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10">
                      <Check className="w-3.5 h-3.5" />
                      Limwa
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
