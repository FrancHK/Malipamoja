'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Users, TrendingUp, CreditCard, PiggyBank, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ContributionsTable } from '@/components/contributions/ContributionsTable'
import { LoanCard } from '@/components/loans/LoanCard'
import { MemberCard } from '@/components/members/MemberCard'
import { AddMemberModal } from '@/components/members/AddMemberModal'
import { AddContributionModal } from '@/components/contributions/AddContributionModal'
import { LoanRequestModal } from '@/components/loans/LoanRequestModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { MOCK_GROUPS, MOCK_MEMBERS, MOCK_CONTRIBUTIONS, MOCK_LOANS, MOCK_TRANSACTIONS } from '@/lib/mock-data'

type Tab = 'overview' | 'members' | 'contributions' | 'loans'

export default function GroupDetailPage() {
  const { id } = useParams()
  const group = MOCK_GROUPS.find((g) => g.id === id) ?? MOCK_GROUPS[0]
  const members = MOCK_MEMBERS.filter((m) => m.group_id === group.id)
  const contributions = MOCK_CONTRIBUTIONS.filter((c) => c.group_id === group.id)
  const loans = MOCK_LOANS.filter((l) => l.group_id === group.id)
  const transactions = MOCK_TRANSACTIONS.filter((t) => t.group_id === group.id)

  const [tab, setTab] = useState<Tab>('overview')
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [showLoanRequest, setShowLoanRequest] = useState(false)

  const isAdmin = group.my_role === 'admin' || group.my_role === 'treasurer'
  const totalSavings = contributions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const pendingCount = contributions.filter((c) => c.status !== 'paid').length
  const activeLoans = loans.filter((l) => l.status === 'active').length

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Muhtasari' },
    { id: 'members', label: 'Wanachama', count: members.length },
    { id: 'contributions', label: 'Michango', count: pendingCount > 0 ? pendingCount : undefined },
    { id: 'loans', label: 'Mikopo', count: loans.length },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header
        title={group.name}
        subtitle={group.description ?? undefined}
        user={{ full_name: 'Amina Johari', email: 'amina@malipamoja.co.tz' }}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Back + tabs */}
        <div className="flex items-center gap-4">
          <Link href="/groups" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800/60 rounded-xl p-1 overflow-x-auto">
            {TABS.map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  tab === id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {label}
                {count != null && (
                  <Badge variant={tab === id ? 'neutral' : 'warning'} className="px-1.5 py-0.5 text-[10px]">{count}</Badge>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          {isAdmin && (
            <div className="flex gap-2">
              {tab === 'members' && (
                <Button size="sm" onClick={() => setShowAddMember(true)}>
                  <Plus className="w-4 h-4" /> Ongeza
                </Button>
              )}
              {tab === 'contributions' && (
                <Button size="sm" onClick={() => setShowAddContribution(true)}>
                  <Plus className="w-4 h-4" /> Rekodi
                </Button>
              )}
              {tab === 'loans' && (
                <Button size="sm" onClick={() => setShowLoanRequest(true)}>
                  <Plus className="w-4 h-4" /> Omba Mkopo
                </Button>
              )}
              <Button size="sm" variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Akiba Yote" value={formatCurrency(totalSavings)} icon={PiggyBank} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
              <StatCard title="Wanachama" value={String(members.length)} icon={Users} iconColor="text-violet-400" iconBg="bg-violet-500/10" />
              <StatCard title="Mikopo Hai" value={String(activeLoans)} icon={CreditCard} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
              <StatCard title="Michango Bado" value={String(pendingCount)} icon={TrendingUp} iconColor="text-red-400" iconBg="bg-red-500/10" />
            </div>

            {/* Group info card */}
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Mchango</p>
                <p className="text-lg font-bold text-white">{formatCurrency(group.contribution_amount)}</p>
                <p className="text-xs text-slate-500">kila {group.contribution_cycle === 'weekly' ? 'wiki' : 'mwezi'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Riba ya Mkopo</p>
                <p className="text-lg font-bold text-amber-400">{group.interest_rate}%</p>
                <p className="text-xs text-slate-500">kwa mwezi</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mkopo wa Juu</p>
                <p className="text-lg font-bold text-violet-400">{group.max_loan_multiplier}×</p>
                <p className="text-xs text-slate-500">ya mchango wako</p>
              </div>
            </div>

            <RecentActivity transactions={transactions} />
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {/* CONTRIBUTIONS TAB */}
        {tab === 'contributions' && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <ContributionsTable
              contributions={contributions}
              canRecord={isAdmin}
              onMarkPaid={(id) => console.log('Mark paid:', id)}
            />
          </div>
        )}

        {/* LOANS TAB */}
        {tab === 'loans' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                canApprove={isAdmin}
                onApprove={(id) => console.log('Approve:', id)}
                onReject={(id) => console.log('Reject:', id)}
                onRepay={(id) => console.log('Repay:', id)}
              />
            ))}
            {loans.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Hakuna mikopo bado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} groupId={group.id} />
      <AddContributionModal
        open={showAddContribution}
        onClose={() => setShowAddContribution(false)}
        groupId={group.id}
        members={members}
        defaultAmount={group.contribution_amount}
      />
      <LoanRequestModal
        open={showLoanRequest}
        onClose={() => setShowLoanRequest(false)}
        groupId={group.id}
        interestRate={group.interest_rate}
        maxAmount={group.contribution_amount * group.max_loan_multiplier}
      />
    </div>
  )
}
