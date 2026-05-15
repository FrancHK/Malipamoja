'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { GroupCard } from '@/components/groups/GroupCard'
import { CreateGroupModal } from '@/components/groups/CreateGroupModal'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/components/providers/UserProvider'
import type { Group } from '@/lib/types'

export default function GroupsPage() {
  const user = useUser()
  const [showCreate, setShowCreate] = useState(false)
  const [editGroup, setEditGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchGroups() {
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
      { data: groupsData },
      { data: allMembers },
      { data: activeLoans },
      { data: paidContributions },
    ] = await Promise.all([
      supabase.from('groups').select('*').in('id', groupIds).order('created_at', { ascending: false }),
      supabase.from('group_members').select('group_id').in('group_id', groupIds).eq('is_active', true),
      supabase.from('loans').select('group_id').in('group_id', groupIds).eq('status', 'active'),
      supabase.from('contributions').select('group_id, amount').in('group_id', groupIds).eq('status', 'paid'),
    ])

    const roleMap = Object.fromEntries((memberships ?? []).map((m) => [m.group_id, m.role]))
    const memberCountMap: Record<string, number> = {}
    for (const m of allMembers ?? []) memberCountMap[m.group_id] = (memberCountMap[m.group_id] ?? 0) + 1
    const loanCountMap: Record<string, number> = {}
    for (const l of activeLoans ?? []) loanCountMap[l.group_id] = (loanCountMap[l.group_id] ?? 0) + 1
    const savingsMap: Record<string, number> = {}
    for (const c of paidContributions ?? []) savingsMap[c.group_id] = (savingsMap[c.group_id] ?? 0) + c.amount

    setGroups((groupsData ?? []).map((g) => ({
      ...g,
      member_count: memberCountMap[g.id] ?? 0,
      total_savings: savingsMap[g.id] ?? 0,
      active_loans: loanCountMap[g.id] ?? 0,
      my_role: roleMap[g.id],
    })) as Group[])
    setLoading(false)
  }

  useEffect(() => { fetchGroups() }, [])

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Vikundi Vyangu"
        subtitle={`Vikundi ${groups.length} unavyohusika navyo`}
        user={user}
        action={{ label: 'Unda Kundi', onClick: () => setShowCreate(true), icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tafuta kundi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm" className="flex-shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Unda Kundi</span>
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Hakuna vikundi</h3>
            <p className="text-slate-500 text-sm mb-6">Unda kundi lako la kwanza la VICOBA</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Unda Kundi la Kwanza
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((group) => (
              <GroupCard key={group.id} group={group} onEdit={setEditGroup} />
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center justify-center gap-3 bg-slate-900/50 border-2 border-dashed border-slate-700/60 hover:border-emerald-500/40 hover:bg-slate-900 rounded-2xl p-8 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">Unda Kundi Jipya</p>
            </button>
          </div>
        )}
      </div>

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => fetchGroups()}
      />

      <CreateGroupModal
        open={!!editGroup}
        group={editGroup ?? undefined}
        onClose={() => setEditGroup(null)}
        onCreated={() => fetchGroups()}
      />
    </div>
  )
}
