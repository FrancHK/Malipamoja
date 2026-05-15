import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { formatCurrency } from '@/lib/utils'
import { PiggyBank, CreditCard, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashibodi Yangu' }

export default async function MemberDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, member_code')
    .eq('id', user.id)
    .single()

  // My contributions
  const { data: contributions } = await supabase
    .from('contributions')
    .select('amount, status, period_start, period_end')
    .eq('member_id', user.id)

  const totalPaid = (contributions ?? []).filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const pendingCount = (contributions ?? []).filter(c => c.status === 'pending').length

  // My groups info
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const groupIds = memberships?.map(m => m.group_id) ?? []

  // All members in my groups (for "hisa" view)
  let totalGroupSavings = 0
  let totalGroupMembers = 0
  let groupLoans: { borrower?: { full_name: string }, amount: number, status: string, purpose?: string | null }[] = []

  if (groupIds.length > 0) {
    const [
      { data: allContribs },
      { data: allMembers },
      { data: loans },
    ] = await Promise.all([
      supabase.from('contributions').select('amount, status').in('group_id', groupIds),
      supabase.from('group_members').select('user_id').in('group_id', groupIds).eq('is_active', true),
      supabase.from('loans')
        .select('amount, status, purpose, borrower_id, borrower:profiles!borrower_id(full_name)')
        .in('group_id', groupIds)
        .in('status', ['active', 'approved']),
    ])

    totalGroupSavings = (allContribs ?? []).filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
    totalGroupMembers = new Set((allMembers ?? []).map(m => m.user_id)).size
    groupLoans = (loans ?? []) as unknown as typeof groupLoans
  }

  // My active loan
  const { data: myLoans } = await supabase
    .from('loans')
    .select('amount, total_due, amount_paid, status, due_date, purpose')
    .eq('borrower_id', user.id)
    .in('status', ['active', 'approved'])

  const activeLoan = myLoans?.[0] ?? null

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Dashibodi Yangu"
        subtitle={`Habari, ${profile?.full_name?.split(' ')[0] ?? 'Mwanachama'}! 👋`}
        user={{ full_name: profile?.full_name ?? '', email: user.email }}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Michango Yangu"
            value={formatCurrency(totalPaid)}
            icon={PiggyBank}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatCard
            title="Michango Bado"
            value={String(pendingCount)}
            icon={TrendingUp}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatCard
            title="Akiba ya Kundi"
            value={formatCurrency(totalGroupSavings)}
            icon={Users}
            iconColor="text-violet-400"
            iconBg="bg-violet-500/10"
          />
          <StatCard
            title="Wanachama"
            value={String(totalGroupMembers)}
            icon={Users}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* My loan status */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 h-full">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Mkopo Wangu
              </h3>
              {activeLoan ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Kiasi cha mkopo</span>
                    <span className="text-white font-semibold">{formatCurrency(activeLoan.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Jumla ya kulipa</span>
                    <span className="text-amber-400 font-semibold">{formatCurrency(activeLoan.total_due)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Umelipa</span>
                    <span className="text-emerald-400 font-semibold">{formatCurrency(activeLoan.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Baki</span>
                    <span className="text-red-400 font-bold">{formatCurrency(activeLoan.total_due - activeLoan.amount_paid)}</span>
                  </div>
                  {activeLoan.due_date && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-2">
                      <p className="text-xs text-amber-400">
                        Tarehe ya mwisho ya kulipa: <span className="font-semibold">{new Date(activeLoan.due_date).toLocaleDateString('sw-TZ')}</span>
                      </p>
                    </div>
                  )}
                  <div className="h-1.5 bg-slate-800 rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((activeLoan.amount_paid / activeLoan.total_due) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-right">
                    {Math.round((activeLoan.amount_paid / activeLoan.total_due) * 100)}% imelipwa
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500 text-sm mb-3">Huna mkopo wa sasa</p>
                  <Link
                    href="/member/loans"
                    className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Omba mkopo →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Group loans (wenzangu wanaokopa) */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
                <h3 className="font-semibold text-white">Mikopo ya Wanachama Wenzangu</h3>
                <span className="text-xs text-slate-500 bg-slate-800 rounded-lg px-2.5 py-1">{groupLoans.length}</span>
              </div>
              {groupLoans.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-500 text-sm">Hakuna mikopo ya sasa</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {groupLoans.map((loan, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{(loan.borrower as any)?.full_name ?? 'Mwanachama'}</p>
                        {loan.purpose && <p className="text-xs text-slate-500 mt-0.5">{loan.purpose}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-amber-400">{formatCurrency(loan.amount)}</p>
                        <p className={`text-xs mt-0.5 ${loan.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {loan.status === 'active' ? 'Hai' : 'Imeidhinishwa'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Angalia Michango', href: '/member/contributions', emoji: '💰' },
            { label: 'Omba Mkopo', href: '/member/loans', emoji: '🏦' },
            { label: 'Historia Yangu', href: '/member/contributions', emoji: '📊' },
          ].map(({ label, href, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-xs font-medium text-slate-400 group-hover:text-white text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
