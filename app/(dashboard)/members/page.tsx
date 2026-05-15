'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { MemberCard } from '@/components/members/MemberCard'
import { Avatar } from '@/components/ui/Avatar'
import { roleBadge, contributionStatusBadge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/providers/UserProvider'
import type { GroupMember, Group } from '@/lib/types'
import type { UserRole } from '@/lib/types'

const ROLE_FILTERS: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'Wote' },
  { value: 'admin', label: 'Admin' },
  { value: 'treasurer', label: 'Msimamizi' },
  { value: 'member', label: 'Wanachama' },
]

export default function MembersPage() {
  const user = useUser()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [members, setMembers] = useState<GroupMember[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', authUser.id)
        .eq('is_active', true)

      const groupIds = memberships?.map((m) => m.group_id) ?? []
      if (groupIds.length === 0) { setLoading(false); return }

      const [{ data: membersData }, { data: groupsData }, { data: contribData }] = await Promise.all([
        supabase
          .from('group_members')
          .select('*, profile:profiles!user_id(id, full_name, phone, avatar_url, member_code, created_at, updated_at)')
          .in('group_id', groupIds)
          .eq('is_active', true)
          .order('joined_at'),
        supabase.from('groups').select('id, name').in('id', groupIds),
        supabase.from('contributions').select('member_id, amount, status').in('group_id', groupIds),
      ])

      const totalMap: Record<string, number> = {}
      const pendingMap: Record<string, number> = {}
      for (const c of contribData ?? []) {
        if (c.status === 'paid') totalMap[c.member_id] = (totalMap[c.member_id] ?? 0) + c.amount
        else pendingMap[c.member_id] = (pendingMap[c.member_id] ?? 0) + c.amount
      }

      const enriched = (membersData ?? []).map((m) => ({
        ...m,
        total_contributions: totalMap[m.user_id] ?? 0,
        pending_contributions: pendingMap[m.user_id] ?? 0,
      })) as GroupMember[]

      setMembers(enriched)
      setGroups((groupsData ?? []) as Group[])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = members.filter((m) => {
    const name = m.profile?.full_name ?? ''
    return name.toLowerCase().includes(search.toLowerCase()) && (roleFilter === 'all' || m.role === roleFilter)
  })

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Wanachama"
        subtitle={`Wanachama ${members.length} katika vikundi vyako`}
        user={user}
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tafuta mwanachama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {ROLE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRoleFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === value ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>Kadi</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${view === 'table' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>Orodha</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Wote', value: members.length, color: 'text-white' },
            { label: 'Admin', value: members.filter((m) => m.role === 'admin').length, color: 'text-violet-400' },
            { label: 'Wasimamizi', value: members.filter((m) => m.role === 'treasurer').length, color: 'text-sky-400' },
            { label: 'Wanachama', value: members.filter((m) => m.role === 'member').length, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Hakuna wanachama wanaofanana na utafutaji</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((member) => <MemberCard key={member.id} member={member} />)}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-800/30">
                  {['Mwanachama', 'Jukumu', 'Vikundi', 'Michango Yote', 'Inasubiri', 'Hali'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((member) => {
                  const name = member.profile?.full_name ?? '—'
                  const hasPending = (member.pending_contributions ?? 0) > 0
                  const groupName = groups.find((g) => g.id === member.group_id)?.name ?? '—'
                  return (
                    <tr key={member.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{name}</p>
                            <p className="text-xs text-slate-500">{member.profile?.phone ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{roleBadge(member.role)}</td>
                      <td className="px-4 py-3.5"><span className="text-sm text-slate-400">{groupName}</span></td>
                      <td className="px-4 py-3.5"><span className="text-sm font-semibold text-emerald-400">{formatCurrency(member.total_contributions ?? 0)}</span></td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-semibold ${hasPending ? 'text-amber-400' : 'text-slate-500'}`}>
                          {hasPending ? formatCurrency(member.pending_contributions!) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{contributionStatusBadge(hasPending ? 'pending' : 'paid')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
