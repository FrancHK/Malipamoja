'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, CreditCard } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { LoanCard } from '@/components/loans/LoanCard'
import { LoanRequestModal } from '@/components/loans/LoanRequestModal'
import { Button } from '@/components/ui/Button'
import { formatCurrency, getLoanProgress } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/providers/UserProvider'
import type { Loan, Group } from '@/lib/types'
import type { LoanStatus } from '@/lib/types'

const STATUS_FILTERS: { value: LoanStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Zote' },
  { value: 'pending', label: 'Zinasubiri' },
  { value: 'active', label: 'Zinaendelea' },
  { value: 'completed', label: 'Zimekamilika' },
  { value: 'rejected', label: 'Zilikataliwa' },
]

export default function LoansPage() {
  const user = useUser()
  const [showRequest, setShowRequest] = useState(false)
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'all'>('all')
  const [loans, setLoans] = useState<Loan[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('member')

  async function fetchData() {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', authUser.id)
      .eq('is_active', true)

    const groupIds = memberships?.map((m) => m.group_id) ?? []
    if (groupIds.length === 0) { setLoading(false); return }

    const roles = memberships?.map((m) => m.role) ?? []
    const topRole = roles.includes('admin') ? 'admin' : roles.includes('treasurer') ? 'treasurer' : 'member'
    setUserRole(topRole)

    const [{ data: loansData }, { data: groupsData }] = await Promise.all([
      supabase
        .from('loans')
        .select('*, borrower:profiles!borrower_id(id, full_name, phone, avatar_url, created_at, updated_at)')
        .in('group_id', groupIds)
        .order('requested_at', { ascending: false }),
      supabase.from('groups').select('*').in('id', groupIds).order('name'),
    ])

    setLoans((loansData ?? []) as Loan[])
    setGroups((groupsData ?? []) as Group[])
    setLoading(false)
  }

  async function handleApprove(id: string) {
    await fetch('/api/loans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loan_id: id, action: 'approve' }),
    })
    fetchData()
  }

  async function handleReject(id: string) {
    await fetch('/api/loans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loan_id: id, action: 'reject' }),
    })
    fetchData()
  }

  useEffect(() => { fetchData() }, [])

  const filtered = loans.filter((l) => statusFilter === 'all' || l.status === statusFilter)
  const totalDisbursed = loans.filter((l) => l.status !== 'pending' && l.status !== 'rejected').reduce((s, l) => s + l.amount, 0)
  const totalOwed = loans.filter((l) => l.status === 'active').reduce((s, l) => s + (l.total_due - l.amount_paid), 0)
  const totalRepaid = loans.reduce((s, l) => s + l.amount_paid, 0)
  const activeCount = loans.filter((l) => l.status === 'active').length
  const pendingCount = loans.filter((l) => l.status === 'pending').length

  const defaultGroup = groups[0]

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Mikopo"
        subtitle="Simamia maombi ya mikopo, idhini, na malipo"
        user={user}
        action={{ label: 'Omba Mkopo', onClick: () => setShowRequest(true), icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Jumla Ilitolewa</p>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(totalDisbursed)}</p>
            <p className="text-xs text-slate-500 mt-1">{activeCount} inayoendelea</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Baki ya Kulipa</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalOwed)}</p>
            <p className="text-xs text-slate-500 mt-1">kutoka mikopo hai</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Jumla Ilipwa</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalRepaid)}</p>
            <div className="h-1.5 bg-slate-800 rounded-full mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${totalDisbursed > 0 ? getLoanProgress(totalRepaid, totalDisbursed + totalOwed) : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Zinasubiri Idhini</p>
            <p className="text-xl font-bold text-violet-400">{pendingCount}</p>
            <p className="text-xs text-slate-500 mt-1">ombi</p>
          </div>
        </div>

        {pendingCount > 0 && (userRole === 'admin' || userRole === 'treasurer') && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-400">Maombi {pendingCount} yanasubiri idhini yako</p>
              <p className="text-xs text-amber-400/70">Kagua na idhinisha au kataa maombi ya mikopo</p>
            </div>
            <button onClick={() => setStatusFilter('pending')} className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
              Angalia →
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === value ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
                {value !== 'all' && ` (${loans.filter((l) => l.status === value).length})`}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <Button size="sm" onClick={() => setShowRequest(true)}>
              <Plus className="w-4 h-4" />
              Omba Mkopo
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Hakuna mikopo ya aina hii</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                canApprove={userRole === 'admin' || userRole === 'treasurer'}
                onApprove={handleApprove}
                onReject={handleReject}
                onRepay={() => fetchData()}
              />
            ))}
          </div>
        )}
      </div>

      {defaultGroup && (
        <LoanRequestModal
          open={showRequest}
          onClose={() => setShowRequest(false)}
          groupId={defaultGroup.id}
          interestRate={defaultGroup.interest_rate}
          maxAmount={defaultGroup.contribution_amount * defaultGroup.max_loan_multiplier}
          onRequested={() => fetchData()}
        />
      )}
    </div>
  )
}
