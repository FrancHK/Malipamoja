import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Bell, ClipboardList, CreditCard, AlertTriangle,
  PiggyBank, ArrowDownLeft, ArrowUpRight,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { getSessionUser, getProfile } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export const metadata: Metadata = { title: 'Arifa' }

interface Notification {
  id: string
  icon: 'application' | 'loan_pending' | 'loan_overdue' | 'contribution' | 'repayment' | 'transaction'
  title: string
  detail: string
  href: string
  created_at: string
}

interface PendingLoanRow { id: string; amount: number; requested_at: string; full_name: string }
interface OverdueLoanRow { id: string; total_due: number; amount_paid: number; due_date: string; full_name: string }
interface TxRow { id: string; type: string; amount: number; description: string | null; created_at: string; group_name: string }

const ICONS = {
  application: { Icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  loan_pending: { Icon: CreditCard, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  loan_overdue: { Icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  contribution: { Icon: PiggyBank, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  repayment: { Icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  transaction: { Icon: ArrowUpRight, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' },
} as const

export default async function NotificationsPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  const isApprover = !!profile && ['mwenyekiti', 'katibu', 'msimamizi'].includes(profile.role)

  const memberships = (await sql`
    select group_id from group_members where user_id = ${user.id} and is_active = true
  `) as { group_id: string }[]
  const groupIds = memberships.map((m) => m.group_id)

  const notifications: Notification[] = []

  // Pending join applications (approver roles only)
  if (isApprover) {
    const apps = (await sql`
      select id, full_name, created_at from member_applications
      where status = 'pending' order by created_at desc limit 20
    `) as { id: string; full_name: string; created_at: string }[]
    for (const a of apps) {
      notifications.push({
        id: `app-${a.id}`,
        icon: 'application',
        title: 'Ombi jipya la kujiunga',
        detail: `${a.full_name} anasubiri idhini yako`,
        href: '/applications',
        created_at: a.created_at,
      })
    }
  }

  if (groupIds.length > 0) {
    const [pendingLoans, overdueLoans, txs] = await Promise.all([
      sql`select l.id, l.amount::float8 as amount, l.requested_at, p.full_name
          from loans l join profiles p on p.id = l.borrower_id
          where l.group_id = any(${groupIds}) and l.status = 'pending'
          order by l.requested_at desc limit 20`,
      sql`select l.id, l.total_due::float8 as total_due, l.amount_paid::float8 as amount_paid, l.due_date, p.full_name
          from loans l join profiles p on p.id = l.borrower_id
          where l.group_id = any(${groupIds}) and l.status = 'active' and l.due_date < current_date
          order by l.due_date asc limit 20`,
      sql`select t.id, t.type, t.amount::float8 as amount, t.description, t.created_at, g.name as group_name
          from transactions t join groups g on g.id = t.group_id
          where t.group_id = any(${groupIds}) and t.created_at > now() - interval '14 days'
          order by t.created_at desc limit 20`,
    ]) as [PendingLoanRow[], OverdueLoanRow[], TxRow[]]

    for (const l of pendingLoans) {
      notifications.push({
        id: `loanp-${l.id}`,
        icon: 'loan_pending',
        title: 'Ombi la mkopo linasubiri',
        detail: `${l.full_name} ameomba mkopo wa ${formatCurrency(l.amount)}`,
        href: '/loans',
        created_at: l.requested_at,
      })
    }
    for (const l of overdueLoans) {
      notifications.push({
        id: `loano-${l.id}`,
        icon: 'loan_overdue',
        title: 'Mkopo umechelewa kurudishwa',
        detail: `${l.full_name} — baki ${formatCurrency(l.total_due - l.amount_paid)}, ulipaswa kulipwa ${formatDateTime(l.due_date)}`,
        href: '/loans',
        created_at: l.due_date,
      })
    }
    for (const t of txs) {
      const label =
        t.type === 'contribution' ? 'Mchango umerekodiwa' :
        t.type === 'repayment' ? 'Marejesho ya mkopo' :
        t.type === 'loan_disbursement' ? 'Mkopo umetolewa' :
        t.type === 'withdrawal' ? 'Pesa imetolewa' : 'Faini imerekodiwa'
      notifications.push({
        id: `tx-${t.id}`,
        icon: t.type === 'contribution' ? 'contribution' : t.type === 'repayment' ? 'repayment' : 'transaction',
        title: label,
        detail: `${t.group_name}: ${formatCurrency(t.amount)}${t.description ? ` — ${t.description}` : ''}`,
        href: '/contributions',
        created_at: t.created_at,
      })
    }
  }

  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Arifa"
        subtitle={`${notifications.length} arifa`}
        user={{ full_name: profile?.full_name ?? 'Mtumiaji', email: user.email }}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl space-y-2">
          {notifications.length === 0 && (
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-10 text-center">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Hakuna arifa kwa sasa</p>
              <p className="text-slate-600 text-xs mt-1">Matukio mapya yataonekana hapa</p>
            </div>
          )}

          {notifications.map((n) => {
            const { Icon, color, bg } = ICONS[n.icon]
            return (
              <Link
                key={n.id}
                href={n.href}
                className="flex items-start gap-3 bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-2xl p-4 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.detail}</p>
                </div>
                <span className="text-[11px] text-slate-600 flex-shrink-0 mt-0.5">{formatDateTime(n.created_at)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
