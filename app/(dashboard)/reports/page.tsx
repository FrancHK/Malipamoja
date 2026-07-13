import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PiggyBank, CreditCard, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { getSessionUser, getProfile } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = { title: 'Ripoti' }

const MONTHS_SW = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des']

interface GroupReportRow {
  id: string
  name: string
  members: number
  savings: number
  disbursed: number
  repaid: number
  outstanding: number
}

interface MonthlyRow { month: string; total: number; entries: number }

export default async function ReportsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  const memberships = (await sql`
    select group_id from group_members where user_id = ${user.id} and is_active = true
  `) as { group_id: string }[]
  const groupIds = memberships.map((m) => m.group_id)

  let groupRows: GroupReportRow[] = []
  let monthly: MonthlyRow[] = []
  const totals = { savings: 0, disbursed: 0, repaid: 0, outstanding: 0 }

  if (groupIds.length > 0) {
    ;[groupRows, monthly] = (await Promise.all([
      sql`
        select g.id, g.name,
               count(distinct gm.user_id) filter (where gm.is_active) as members,
               coalesce(sum(c.amount) filter (where c.status = 'paid'), 0)::float8 as savings,
               coalesce(sum(l.amount) filter (where l.status in ('approved','active','completed')), 0)::float8 as disbursed,
               coalesce(sum(l.amount_paid), 0)::float8 as repaid,
               coalesce(sum(l.total_due - l.amount_paid) filter (where l.status = 'active'), 0)::float8 as outstanding
        from groups g
        left join group_members gm on gm.group_id = g.id
        left join contributions c on c.group_id = g.id
        left join loans l on l.group_id = g.id
        where g.id = any(${groupIds})
        group by g.id, g.name
        order by g.name
      `,
      sql`
        select date_trunc('month', paid_at) as month,
               sum(amount)::float8 as total,
               count(*)::int as entries
        from contributions
        where group_id = any(${groupIds}) and status = 'paid' and paid_at is not null
          and paid_at > now() - interval '6 months'
        group by 1 order by 1 desc
      `,
    ])) as [GroupReportRow[], MonthlyRow[]]

    for (const g of groupRows) {
      totals.savings += g.savings
      totals.disbursed += g.disbursed
      totals.repaid += g.repaid
      totals.outstanding += g.outstanding
    }
  }

  const maxMonthly = Math.max(1, ...monthly.map((m) => m.total as number))

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Ripoti"
        subtitle="Muhtasari wa fedha za vikundi vyako"
        user={{ full_name: profile?.full_name ?? 'Mtumiaji', email: user.email }}
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Totals */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Akiba Yote" value={formatCurrency(totals.savings)} icon={PiggyBank} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />
          <StatCard title="Mikopo Iliyotolewa" value={formatCurrency(totals.disbursed)} icon={CreditCard} iconColor="text-amber-400" iconBg="bg-amber-500/10" />
          <StatCard title="Imerudishwa" value={formatCurrency(totals.repaid)} icon={TrendingUp} iconColor="text-sky-400" iconBg="bg-sky-500/10" />
          <StatCard title="Baki ya Mikopo" value={formatCurrency(totals.outstanding)} icon={AlertCircle} iconColor="text-red-400" iconBg="bg-red-500/10" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Per-group table */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white">Ripoti kwa Kikundi</h3>
            </div>
            {groupRows.length === 0 ? (
              <p className="text-slate-500 text-sm p-8 text-center">Hujajiunga na kikundi chochote bado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-slate-800/60">
                      <th className="px-5 py-3 font-medium">Kikundi</th>
                      <th className="px-3 py-3 font-medium text-right">Wanachama</th>
                      <th className="px-3 py-3 font-medium text-right">Akiba</th>
                      <th className="px-3 py-3 font-medium text-right">Mikopo</th>
                      <th className="px-5 py-3 font-medium text-right">Baki</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((g) => (
                      <tr key={g.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3 text-white font-medium">{g.name}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{g.members}</td>
                        <td className="px-3 py-3 text-right text-emerald-400">{formatCurrency(g.savings)}</td>
                        <td className="px-3 py-3 text-right text-amber-400">{formatCurrency(g.disbursed)}</td>
                        <td className="px-5 py-3 text-right text-red-400">{formatCurrency(g.outstanding)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Monthly contributions */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">Michango kwa Mwezi <span className="text-xs text-slate-500 font-normal">(miezi 6)</span></h3>
            {monthly.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">Hakuna michango iliyolipwa bado</p>
            ) : (
              <div className="space-y-3">
                {monthly.map((m) => {
                  const d = new Date(m.month)
                  return (
                    <div key={String(m.month)}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">{MONTHS_SW[d.getMonth()]} {d.getFullYear()}</span>
                        <span className="text-white font-medium">{formatCurrency(m.total)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                          style={{ width: `${Math.round((m.total / maxMonthly) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{m.entries} michango</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
