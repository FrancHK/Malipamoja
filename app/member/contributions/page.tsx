import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Michango Yangu' }

const STATUS_CONFIG = {
  paid:    { label: 'Imelipwa',  icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  pending: { label: 'Inasubiri', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'   },
  late:    { label: 'Imechelewa',icon: AlertCircle,  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20'       },
}

export default async function MemberContributionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: contributions } = await supabase
    .from('contributions')
    .select('*, group:groups(name)')
    .eq('member_id', user.id)
    .order('created_at', { ascending: false })

  const list = contributions ?? []
  const totalPaid = list.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const totalPending = list.filter(c => c.status !== 'paid').reduce((s, c) => s + c.amount, 0)

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Michango Yangu"
        subtitle={`Jumla iliyolipwa: ${formatCurrency(totalPaid)}`}
        user={{ full_name: profile?.full_name ?? '', email: user.email }}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Jumla Iliyolipwa</p>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Bado Kulipa</p>
            <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalPending)}</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl">
          <div className="p-5 border-b border-slate-800/60">
            <h3 className="font-semibold text-white">Historia ya Michango</h3>
          </div>
          {list.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">Hakuna michango bado</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {list.map(c => {
                const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
                const Icon = cfg.icon
                return (
                  <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{(c as any).group?.name ?? 'Kundi'}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(c.period_start).toLocaleDateString('sw-TZ', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(c.amount)}</p>
                      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                    </div>
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
