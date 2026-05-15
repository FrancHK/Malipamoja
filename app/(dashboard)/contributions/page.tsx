'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download, PiggyBank } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ContributionsTable } from '@/components/contributions/ContributionsTable'
import { AddContributionModal } from '@/components/contributions/AddContributionModal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/providers/UserProvider'
import type { Contribution, Group, GroupMember } from '@/lib/types'
import type { ContributionStatus } from '@/lib/types'

const STATUS_FILTERS: { value: ContributionStatus | 'all'; label: string; variant: 'neutral' | 'success' | 'warning' | 'danger' }[] = [
  { value: 'all', label: 'Zote', variant: 'neutral' },
  { value: 'paid', label: 'Zimelipwa', variant: 'success' },
  { value: 'pending', label: 'Zinasubiri', variant: 'warning' },
  { value: 'late', label: 'Zimechelewa', variant: 'danger' },
]

export default function ContributionsPage() {
  const user = useUser()
  const [showAdd, setShowAdd] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

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

    const [
      { data: contribData },
      { data: groupsData },
      { data: membersData },
    ] = await Promise.all([
      supabase
        .from('contributions')
        .select('*, member:profiles!member_id(full_name, phone, avatar_url, id, created_at, updated_at)')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false }),
      supabase.from('groups').select('*').in('id', groupIds).order('name'),
      supabase
        .from('group_members')
        .select('*, profile:profiles!user_id(id, full_name, phone, avatar_url, created_at, updated_at)')
        .in('group_id', groupIds)
        .eq('is_active', true),
    ])

    setContributions((contribData ?? []) as Contribution[])
    setGroups((groupsData ?? []) as Group[])
    setMembers((membersData ?? []) as GroupMember[])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = contributions.filter((c) => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    const matchGroup = groupFilter === 'all' || c.group_id === groupFilter
    return matchStatus && matchGroup
  })

  const totalPaid = contributions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0)
  const totalPending = contributions.filter((c) => c.status !== 'paid').reduce((s, c) => s + c.amount, 0)
  const paidCount = contributions.filter((c) => c.status === 'paid').length
  const pendingCount = contributions.filter((c) => c.status === 'pending').length
  const lateCount = contributions.filter((c) => c.status === 'late').length

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Michango"
        subtitle="Fuatilia na simamia michango ya wanachama wote"
        user={user}
        action={{ label: 'Rekodi Mchango', onClick: () => setShowAdd(true), icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Zimelipwa</span>
            </div>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-slate-500 mt-1">{paidCount} michango</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Zinasubiri</span>
            </div>
            <p className="text-xl font-bold text-amber-400">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-slate-500 mt-1">{pendingCount + lateCount} michango</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Zimechelewa</p>
            <p className="text-xl font-bold text-red-400">{lateCount}</p>
            <p className="text-xs text-slate-500 mt-1">michango</p>
          </div>
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Asilimia ya Malipo</p>
            <p className="text-xl font-bold text-white">
              {contributions.length > 0 ? Math.round((paidCount / contributions.length) * 100) : 0}%
            </p>
            <div className="h-1.5 bg-slate-800 rounded-full mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${contributions.length > 0 ? Math.round((paidCount / contributions.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500">Hali:</span>
            {STATUS_FILTERS.map(({ value, label, variant }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === value ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {label}
                {value !== 'all' && (
                  <Badge variant={variant} className="ml-1.5 px-1.5 py-0 text-[10px]">
                    {contributions.filter((c) => c.status === value).length}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Kundi:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="all">Vikundi Vyote</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:ml-auto">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4" />
              Pakua CSV
            </Button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <ContributionsTable
              contributions={filtered}
              canRecord={true}
              onMarkPaid={() => fetchData()}
            />
          )}
        </div>
      </div>

      <AddContributionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        groupId={groups[0]?.id ?? ''}
        members={members}
        defaultAmount={groups[0]?.contribution_amount ?? 50000}
        onAdded={() => fetchData()}
      />
    </div>
  )
}
