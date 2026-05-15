'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { CreditCard } from 'lucide-react'

interface Group { id: string; name: string; interest_rate: number; max_loan_multiplier: number }

export function MemberLoanRequest({ groups, memberId }: { groups: Group[]; memberId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState('3')
  const [purpose, setPurpose] = useState('')
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')

  const selectedGroup = groups.find(g => g.id === groupId)
  const amt = Number(amount) || 0
  const mon = Number(months) || 1
  const total = amt + (amt * (selectedGroup?.interest_rate ?? 10) / 100) * (mon / 12)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: groupId,
          borrower_id: memberId,
          amount: amt,
          interest_rate: selectedGroup?.interest_rate ?? 10,
          duration_months: mon,
          total_due: total,
          purpose,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Imeshindwa kutuma ombi')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hitilafu imetokea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shrink-0">
        <CreditCard className="w-4 h-4" />
        Omba Mkopo
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Omba Mkopo">
        <form onSubmit={handleSubmit} className="space-y-4">
          {groups.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Kundi</label>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          <Input
            label="Kiasi cha Mkopo (TZS)"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            required
            min="1"
          />

          <Input
            label="Muda (miezi)"
            type="number"
            value={months}
            onChange={e => setMonths(e.target.value)}
            min="1"
            max="24"
            required
          />

          <Input
            label="Sababu ya Mkopo"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="Mfano: Biashara, Elimu..."
          />

          {amt > 0 && (
            <div className="bg-slate-800/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Riba ({selectedGroup?.interest_rate ?? 10}%/mwaka)</span>
                <span className="text-white">{formatCurrency(total - amt)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-slate-700/60 pt-2 mt-2">
                <span className="text-slate-300">Jumla ya kulipa</span>
                <span className="text-amber-400">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Ghairi</Button>
            <Button type="submit" loading={loading} className="flex-1">Tuma Ombi</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
