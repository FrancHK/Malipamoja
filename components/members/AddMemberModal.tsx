'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface AddMemberModalProps {
  open: boolean
  onClose: () => void
  groupId: string
  onAdded?: () => void
}

export function AddMemberModal({ open, onClose, groupId, onAdded }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      group_id: groupId,
      email: fd.get('email'),
      role: fd.get('role'),
    }
    try {
      const res = await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Hitilafu imetokea')
      onAdded?.()
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ongeza Mwanachama" description="Tuma mwaliko kwa mwanachama mpya kwa kutumia barua pepe">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Barua Pepe" name="email" type="email" placeholder="mwanachama@mfano.com" required />
        <Select
          label="Jukumu"
          name="role"
          options={[
            { value: 'member', label: 'Mwanachama' },
            { value: 'treasurer', label: 'Msimamizi wa Fedha' },
            { value: 'admin', label: 'Msimamizi Mkuu' },
          ]}
        />
        {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Ghairi</Button>
          <Button type="submit" loading={loading} className="flex-1">Ongeza Mwanachama</Button>
        </div>
      </form>
    </Modal>
  )
}
