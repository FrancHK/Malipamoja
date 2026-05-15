'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, Phone, Briefcase, User, MessageSquare, Hash, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { MemberApplication } from '@/lib/types'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ApplicationCard({ app, onAction }: { app: MemberApplication; onAction: (id: string, action: 'approve' | 'reject', reason?: string) => void }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  const isPending = app.status === 'pending'

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    await onAction(app.id, action, action === 'reject' ? reason : undefined)
    setLoading(null)
    setRejecting(false)
  }

  return (
    <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">{app.full_name}</h3>
          </div>
          <p className="text-xs text-slate-500">{formatDate(app.created_at)}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          app.status === 'pending'  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
          app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {app.status === 'pending' ? 'Inasubiri' : app.status === 'approved' ? 'Imekubaliwa' : 'Imekataliwa'}
        </span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-xl p-2.5">
          <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="text-xs text-slate-300 truncate">{app.phone}</span>
        </div>
        {app.occupation && (
          <div className="flex items-center gap-2 bg-slate-800/40 rounded-xl p-2.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-300 truncate">{app.occupation}</span>
          </div>
        )}
        {app.id_number && (
          <div className="flex items-center gap-2 bg-slate-800/40 rounded-xl p-2.5">
            <Hash className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-300 truncate">{app.id_number}</span>
          </div>
        )}
        {app.group?.name && (
          <div className="flex items-center gap-2 bg-slate-800/40 rounded-xl p-2.5 col-span-2">
            <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-300 truncate">Kundi: <span className="text-white">{app.group.name}</span></span>
          </div>
        )}
        {app.member_code && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <Hash className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-emerald-400 font-mono font-semibold">{app.member_code}</span>
          </div>
        )}
      </div>

      {app.reason && (
        <div className="flex items-start gap-2 bg-slate-800/30 rounded-xl p-3">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">{app.reason}</p>
        </div>
      )}

      {app.rejection_reason && (
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
          <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-400 leading-relaxed">{app.rejection_reason}</p>
        </div>
      )}

      {/* Actions */}
      {isPending && !rejecting && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            loading={loading === 'approve'}
            disabled={loading !== null}
            onClick={() => handle('approve')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Kubali
          </Button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => setRejecting(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl py-2 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Kataa
          </button>
        </div>
      )}

      {isPending && rejecting && (
        <div className="space-y-2 pt-1">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Sababu ya kukataa (si lazima)..."
            rows={2}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-red-500/50"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={loading === 'reject'}
              disabled={loading !== null}
              onClick={() => handle('reject')}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
            >
              Thibitisha Kukataa
            </Button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="px-3 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Rudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ApplicationsClient({
  pending,
  done,
}: {
  pending: MemberApplication[]
  done: MemberApplication[]
}) {
  const router = useRouter()
  const [pendingList, setPendingList] = useState(pending)
  const [doneList, setDoneList] = useState(done)

  async function handleAction(id: string, action: 'approve' | 'reject', reason?: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, rejection_reason: reason }),
    })
    if (res.ok) {
      const app = pendingList.find(a => a.id === id)
      if (app) {
        const updated = { ...app, status: action === 'approve' ? 'approved' : 'rejected' } as MemberApplication
        setPendingList(prev => prev.filter(a => a.id !== id))
        setDoneList(prev => [updated, ...prev])
      }
      router.refresh()
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Pending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-white">Zinasubiri Idhini</h2>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{pendingList.length}</span>
        </div>
        {pendingList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-8 text-center">
            <p className="text-slate-500 text-sm">Hakuna maombi yanayosubiri</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingList.map(app => (
              <ApplicationCard key={app.id} app={app} onAction={handleAction} />
            ))}
          </div>
        )}
      </section>

      {/* Done */}
      {doneList.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-400">Zilizofanyiwa Maamuzi</h2>
            <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{doneList.length}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {doneList.map(app => (
              <ApplicationCard key={app.id} app={app} onAction={handleAction} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
