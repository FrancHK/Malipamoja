'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Group } from '@/lib/types'

interface CreateGroupModalProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
  group?: Group // if provided, we're editing
}

export function CreateGroupModal({ open, onClose, onCreated, group }: CreateGroupModalProps) {
  const isEdit = !!group
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      description: fd.get('description'),
      contribution_amount: Number(fd.get('contribution_amount')),
      contribution_cycle: fd.get('contribution_cycle'),
    }
    try {
      const res = await fetch(
        isEdit ? `/api/groups/${group.id}` : '/api/groups',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      if (!res.ok) throw new Error((await res.json()).error ?? 'Hitilafu imetokea')
      onCreated?.()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Hariri Kundi' : 'Unda Kundi Jipya'}
      description={isEdit ? `Badilisha taarifa za kundi la ${group.name}` : 'Weka taarifa za msingi za kundi lako la VICOBA'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Jina la Kundi"
          name="name"
          placeholder="mf. Umoja Savings Group"
          required
          defaultValue={group?.name}
        />
        <div>
          <label className="text-sm font-medium text-slate-300 block mb-1.5">Maelezo (si lazima)</label>
          <textarea
            name="description"
            placeholder="Maelezo mafupi ya kundi..."
            rows={2}
            defaultValue={group?.description ?? ''}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 hover:border-slate-600 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mchango (TZS)"
            name="contribution_amount"
            type="number"
            placeholder="50000"
            required
            min={1000}
            defaultValue={group?.contribution_amount}
          />
          <Select
            label="Mzunguko"
            name="contribution_cycle"
            defaultValue={group?.contribution_cycle ?? 'monthly'}
            options={[
              { value: 'monthly', label: 'Kila Mwezi' },
              { value: 'weekly', label: 'Kila Wiki' },
            ]}
          />
        </div>
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Ghairi</Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Hifadhi Mabadiliko' : 'Unda Kundi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
