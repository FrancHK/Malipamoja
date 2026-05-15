'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, Phone, User, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { SystemRole } from '@/lib/types'

const ROLE_OPTIONS: { value: SystemRole; label: string }[] = [
  { value: 'katibu',       label: 'Katibu (Secretary)' },
  { value: 'mweka_hazina', label: 'Mweka Hazina (Treasurer)' },
  { value: 'msimamizi',    label: 'Msimamizi (Manager)' },
]

interface StaffMember {
  id: string
  full_name: string
  phone: string | null
  role: string
  created_at: string
}

export function StaffClient({ staff, roleLabels }: { staff: StaffMember[]; roleLabels: Record<string, string> }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ temp_password: string; full_name: string } | null>(null)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('full_name'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          role: fd.get('role'),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreated({ temp_password: data.temp_password, full_name: fd.get('full_name') as string })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hitilafu imetokea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Add staff button */}
      <div className="flex justify-end">
        <Button onClick={() => { setOpen(true); setCreated(null); setError('') }} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Ongeza Mfanyakazi
        </Button>
      </div>

      {/* Staff list */}
      <div className="bg-slate-900 border border-slate-800/60 rounded-2xl">
        <div className="p-5 border-b border-slate-800/60">
          <h2 className="font-semibold text-white">Timu ya Uongozi ({staff.length})</h2>
        </div>
        <div className="divide-y divide-slate-800/60">
          {staff.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{s.full_name}</p>
                {s.phone && <p className="text-xs text-slate-500 mt-0.5">{s.phone}</p>}
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                {roleLabels[s.role] ?? s.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Ongeza Mfanyakazi Mpya">
        {created ? (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-emerald-400 font-semibold mb-1">Amefanikiwa Kuundwa! ✅</p>
              <p className="text-slate-300 text-sm">{created.full_name}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Nywila ya muda (mpe mfanyakazi huyu):</p>
              <p className="font-mono text-white text-sm bg-slate-900 rounded-lg px-3 py-2 mt-1 break-all">
                {created.temp_password}
              </p>
            </div>
            <p className="text-xs text-slate-500">Mfanyakazi atabadilisha nywila hii baada ya kuingia mara ya kwanza.</p>
            <Button className="w-full" onClick={() => setOpen(false)}>Imekwisha</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Jina Kamili *" name="full_name" placeholder="Amina Johari" required suffix={<User className="w-4 h-4" />} />
            <Input label="Barua Pepe *" name="email" type="email" placeholder="amina@mfano.com" required suffix={<Mail className="w-4 h-4" />} />
            <Input label="Nambari ya Simu" name="phone" type="tel" placeholder="+255 7XX XXX XXX" suffix={<Phone className="w-4 h-4" />} />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Nafasi *
              </label>
              <select
                name="role"
                required
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">Chagua nafasi...</option>
                {ROLE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1">Ghairi</Button>
              <Button type="submit" loading={loading} className="flex-1">Unda Akaunti</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
