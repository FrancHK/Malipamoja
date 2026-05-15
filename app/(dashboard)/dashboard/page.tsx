import { Metadata } from 'next'
import { PiggyBank, Users, CreditCard, AlertCircle, TrendingUp, Wallet } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { GroupCard } from '@/components/groups/GroupCard'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import type { Group, Transaction, DashboardStats } from '@/lib/types'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userFullName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Mtumiaji'

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const groupIds = memberships?.map((m) => m.group_id) ?? []

  let stats: DashboardStats = {
    total_savings: 0,
    active_members: 0,
    active_loans: 0,
    pending_contributions: 0,
    total_disbursed: 0,
    total_repaid: 0,
  }
  let groups: Group[] = []
  let transactions: Transaction[] = []

  if (groupIds.length > 0) {
    const [
      { data: groupsData },
      { data: allMembers },
      { data: allLoans },
      { data: allContributions },
      { data: txData },
    ] = await Promise.all([
      supabase.from('groups').select('*').in('id', groupIds).order('created_at', { ascending: false }).limit(3),
      supabase.from('group_members').select('group_id, user_id').in('group_id', groupIds).eq('is_active', true),
      supabase.from('loans').select('group_id, amount, amount_paid, total_due, status').in('group_id', groupIds),
      supabase.from('contributions').select('group_id, member_id, amount, status').in('group_id', groupIds),
      supabase.from('transactions').select('*').in('group_id', groupIds).order('created_at', { ascending: false }).limit(6),
    ])

    const roleMap = Object.fromEntries((memberships ?? []).map((m) => [m.group_id, m.role]))

    const memberCountMap: Record<string, number> = {}
    const uniqueUserIds = new Set<string>()
    for (const m of allMembers ?? []) {
      memberCountMap[m.group_id] = (memberCountMap[m.group_id] ?? 0) + 1
      uniqueUserIds.add(m.user_id)
    }

    const activeLoanCountMap: Record<string, number> = {}
    let totalDisbursed = 0
    let totalRepaid = 0
    for (const l of allLoans ?? []) {
      if (l.status === 'active') activeLoanCountMap[l.group_id] = (activeLoanCountMap[l.group_id] ?? 0) + 1
      if (l.status !== 'pending' && l.status !== 'rejected') totalDisbursed += l.amount
      totalRepaid += l.amount_paid
    }

    const totalSavingsMap: Record<string, number> = {}
    let totalSavings = 0
    let pendingCount = 0
    for (const c of allContributions ?? []) {
      if (c.status === 'paid') {
        totalSavingsMap[c.group_id] = (totalSavingsMap[c.group_id] ?? 0) + c.amount
        totalSavings += c.amount
      }
      if (c.status === 'pending') pendingCount++
    }

    groups = (groupsData ?? []).map((g) => ({
      ...g,
      member_count: memberCountMap[g.id] ?? 0,
      total_savings: totalSavingsMap[g.id] ?? 0,
      active_loans: activeLoanCountMap[g.id] ?? 0,
      my_role: roleMap[g.id],
    })) as Group[]

    stats = {
      total_savings: totalSavings,
      active_members: uniqueUserIds.size,
      active_loans: (allLoans ?? []).filter((l) => l.status === 'active').length,
      pending_contributions: pendingCount,
      total_disbursed: totalDisbursed,
      total_repaid: totalRepaid,
    }

    transactions = (txData ?? []) as Transaction[]
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashboard"
        subtitle={`Habari ya asubuhi — leo ni tarehe ${new Date().toLocaleDateString('sw-TZ', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        user={{ full_name: userFullName, email: user.email }}
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="col-span-2 xl:col-span-2">
            <StatCard
              title="Akiba Yote"
              value={formatCurrency(stats.total_savings)}
              icon={PiggyBank}
              iconColor="text-emerald-400"
              iconBg="bg-emerald-500/10"
            />
          </div>
          <StatCard
            title="Wanachama Hai"
            value={String(stats.active_members)}
            icon={Users}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10"
          />
          <StatCard
            title="Mikopo Hai"
            value={String(stats.active_loans)}
            icon={CreditCard}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            title="Michango Bado"
            value={String(stats.pending_contributions)}
            icon={AlertCircle}
            iconColor="text-red-400"
            iconBg="bg-red-500/10"
          />
          <StatCard
            title="Jumla Walipwa"
            value={formatCurrency(stats.total_repaid)}
            icon={TrendingUp}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <RecentActivity transactions={transactions} />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Muhtasari wa Mikopo</h3>
                <Wallet className="w-4 h-4 text-slate-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Jumla Ilitolewa</span>
                  <span className="text-sm font-semibold text-amber-400">{formatCurrency(stats.total_disbursed)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Imerudishwa</span>
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(stats.total_repaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Baki ya Kurudisha</span>
                  <span className="text-sm font-semibold text-red-400">{formatCurrency(stats.total_disbursed - stats.total_repaid)}</span>
                </div>
                {stats.total_disbursed > 0 && (
                  <>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        style={{ width: `${Math.round((stats.total_repaid / stats.total_disbursed) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 text-right">
                      {Math.round((stats.total_repaid / stats.total_disbursed) * 100)}% imerudishwa
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Hatua za Haraka</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Vikundi', href: '/groups', emoji: '👥' },
                  { label: 'Rekodi Mchango', href: '/contributions', emoji: '💰' },
                  { label: 'Maombi', href: '/applications', emoji: '📋' },
                  { label: 'Wanachama', href: '/members', emoji: '👤' },
                ].map(({ label, href, emoji }) => (
                  <a
                    key={href}
                    href={href}
                    className="flex flex-col items-center gap-2 p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/30 hover:border-emerald-500/30 rounded-xl transition-all duration-150 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-white text-center leading-tight">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {groups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Vikundi Vyangu</h3>
              <a href="/groups" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">Angalia vyote →</a>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </div>
        )}

        {groups.length === 0 && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">Hujajiunga na kundi lolote bado.</p>
            <a href="/groups" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
              Unda au jiunge na kundi →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
