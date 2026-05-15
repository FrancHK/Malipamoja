'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { GroupMember } from '@/lib/types'

interface AddContributionModalProps {
  open: boolean
  onClose: () => void
  groupId: string
  members: GroupMember[]
  defaultAmount?: number
  onAdded?: () => void
}

export function AddContributionModal({ open, onClose, groupId, members, defaultAmount, onAdded }: AddContributionModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const memberOptions = members.map((m) => ({
    value: m.user_id,
    label: m.profile?.full_name ?? m.user_id,
  }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      group_id: groupId,
      member_id: fd.get('member_id'),
      amount: Number(fd.get('amount')),
      period_start: fd.get('period_start'),
      period_end: fd.get('period_end'),
      notes: fd.get('notes') || null,
    }
    try {
      const res = await fetch('/api/contributions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Hitilafu imetokea')
      onAdded?.()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const lastStr = `${lastOfMonth.getFullYear()}-${String(lastOfMonth.getMonth() + 1).padStart(2, '0')}-${String(lastOfMonth.getDate()).padStart(2, '0')}`

  return (
    <Modal open={open} onClose={onClose} title="Rekodi Mchango" description="Rekodi malipo ya mchango kwa mwanachama">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Mwanachama" name="member_id" options={memberOptions} required />
        <Input label="Kiasi (TZS)" name="amount" type="number" placeholder="50000" defaultValue={defaultAmount} required min={0} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Mwanzo wa Kipindi" name="period_start" type="date" defaultValue={firstOfMonth} required />
          <Input label="Mwisho wa Kipindi" name="period_end" type="date" defaultValue={lastStr} required />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-1.5">Maelezo (si lazima)</label>
          <textarea
            name="notes"
            placeholder="Maelezo ya ziada..."
            rows={2}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Ghairi</Button>
          <Button type="submit" loading={loading} className="flex-1">Rekodi Mchango</Button>
        </div>
      </form>
    </Modal>
  )
}
