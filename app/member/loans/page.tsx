import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { MemberLoanRequest } from '@/components/loans/MemberLoanRequest'

export const metadata: Metadata = { title: 'Mikopo Yangu' }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Inasubiri',    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  approved:  { label: 'Imeidhinishwa',color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  active:    { label: 'Hai',          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  rejected:  { label: 'Imekataliwa', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  completed: { label: 'Imekamilika', color: 'text-slate-400 bg-slate-800 border-slate-700' },
}

export default async function MemberLoansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: loans } = await supabase
    .from('loans')
    .select('*')
    .eq('borrower_id', user.id)
    .order('created_at', { ascending: false })

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, interest_rate, max_loan_multiplier)')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const myGroups = (memberships ?? []).map(m => (m as any).groups).filter(Boolean)
  const hasActiveOrPending = (loans ?? []).some(l => ['pending', 'active', 'approved'].includes(l.status))

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Mikopo Yangu"
        subtitle={`${(loans ?? []).length} mkopo wa historia`}
        user={{ full_name: profile?.full_name ?? '', email: user.email }}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Request loan CTA */}
        {!hasActiveOrPending && myGroups.length > 0 && (
          <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Omba Mkopo</p>
              <p className="text-slate-400 text-sm mt-1">Unaweza kuomba mkopo kutoka kwenye kundi lako</p>
            </div>
            <MemberLoanRequest groups={myGroups} memberId={user.id} />
          </div>
        )}

        {/* Loans list */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl">
          <div className="p-5 border-b border-slate-800/60">
            <h3 className="font-semibold text-white">Historia ya Mikopo</h3>
          </div>
          {(loans ?? []).length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">Hujawahi kuomba mkopo</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {(loans ?? []).map(loan => {
                const s = STATUS_LABELS[loan.status] ?? STATUS_LABELS.pending
                const remaining = loan.total_due - loan.amount_paid
                return (
                  <div key={loan.id} className="px-5 py-4 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-white font-semibold">{formatCurrency(loan.amount)}</p>
                        {loan.purpose && <p className="text-xs text-slate-500 mt-0.5">{loan.purpose}</p>}
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
                        {s.label}
                      </span>
                    </div>
                    {['active', 'approved'].includes(loan.status) && (
                      <div className="space-y-1.5 mt-3">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Umelipa {formatCurrency(loan.amount_paid)}</span>
                          <span>Baki {formatCurrency(remaining)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.round((loan.amount_paid / loan.total_due) * 100))}%` }}
                          />
                        </div>
                        {loan.due_date && (
                          <p className="text-xs text-amber-400">
                            Mwisho: {new Date(loan.due_date).toLocaleDateString('sw-TZ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
