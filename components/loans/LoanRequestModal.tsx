'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { formatCurrency, calculateLoanTotal, calculateMonthlyRepayment } from '@/lib/utils'

interface LoanRequestModalProps {
  open: boolean
  onClose: () => void
  groupId: string
  interestRate: number
  maxAmount?: number
  onRequested?: () => void
}

export function LoanRequestModal({ open, onClose, groupId, interestRate, maxAmount, onRequested }: LoanRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amount, setAmount] = useState('')
  const [months, setMonths] = useState('3')

  const amt = Number(amount) || 0
  const mon = Number(months) || 1
  const total = calculateLoanTotal(amt, interestRate, mon)
  const monthly = calculateMonthlyRepayment(total, mon)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      group_id: groupId,
      amount: amt,
      duration_months: mon,
      interest_rate: interestRate,
      total_due: total,
      purpose: fd.get('purpose'),
    }
    try {
      const res = await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Hitilafu imetokea')
      onRequested?.()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Omba Mkopo" description="Jaza fomu ya mkopo — utakaguliwa na msimamizi">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Kiasi cha Mkopo (TZS)"
          name="amount"
          type="number"
          placeholder="300000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={1000}
          max={maxAmount}
        />
        <Select
          label="Muda wa Mkopo"
          name="duration_months"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          options={[1,2,3,4,6,12].map((m) => ({ value: String(m), label: `${m} ${m === 1 ? 'Mwezi' : 'Miezi'}` }))}
        />
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-1.5">Sababu ya Mkopo</label>
          <textarea
            name="purpose"
            placeholder="Sababu ya mkopo..."
            rows={2}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Summary */}
        {amt > 0 && (
          <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Muhtasari wa Mkopo</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500">Mkopo</p>
                <p className="text-sm font-bold text-white">{formatCurrency(amt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Riba {interestRate}%</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(total - amt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Jumla</p>
                <p className="text-sm font-bold text-emerald-400">{formatCurrency(total)}</p>
              </div>
            </div>
            <p className="text-xs text-center text-slate-500 border-t border-slate-700 pt-2">
              Malipo ya kila mwezi: <span className="text-white font-semibold">{formatCurrency(monthly)}</span>
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Ghairi</Button>
          <Button type="submit" loading={loading} className="flex-1">Omba Mkopo</Button>
        </div>
      </form>
    </Modal>
  )
}
