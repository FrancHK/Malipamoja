'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Lock, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authClient } from '@/lib/auth/client'
import type { Profile } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  mwenyekiti: 'Mwenyekiti',
  katibu: 'Katibu',
  mweka_hazina: 'Mweka Hazina',
  msimamizi: 'Msimamizi',
  mwanachama: 'Mwanachama',
}

function Banner({ kind, text, onClose }: { kind: 'ok' | 'err'; text: string; onClose: () => void }) {
  return (
    <div className={`rounded-xl px-4 py-3 flex items-start justify-between gap-3 border ${
      kind === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
    }`}>
      <p className={`text-sm ${kind === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{text}</p>
      <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
    </div>
  )
}

export function SettingsClient({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter()

  // ── Profile form ────────────────────────────────────────────────────────────
  const [profileMsg, setProfileMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMsg(null)
    setSavingProfile(true)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fd.get('full_name'), phone: fd.get('phone') }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? `Hitilafu ya seva (${res.status})`)
      setProfileMsg({ kind: 'ok', text: 'Wasifu umehifadhiwa' })
      router.refresh()
    } catch (err) {
      setProfileMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Hitilafu imetokea' })
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Password form ───────────────────────────────────────────────────────────
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [savingPw, setSavingPw] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwMsg(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const currentPassword = fd.get('current_password') as string
    const newPassword = fd.get('new_password') as string
    const confirm = fd.get('confirm_password') as string

    if (newPassword.length < 8) {
      setPwMsg({ kind: 'err', text: 'Nywila mpya lazima iwe na herufi 8 au zaidi' })
      return
    }
    if (newPassword !== confirm) {
      setPwMsg({ kind: 'err', text: 'Nywila mpya hazifanani' })
      return
    }

    setSavingPw(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (error) throw new Error(/invalid|password|credential/i.test(error.message ?? '') ? 'Nywila ya sasa si sahihi' : (error.message ?? 'Imeshindikana'))
      setPwMsg({ kind: 'ok', text: 'Nywila imebadilishwa' })
      form.reset()
    } catch (err) {
      setPwMsg({ kind: 'err', text: err instanceof Error ? err.message : 'Hitilafu imetokea' })
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account info */}
      <section className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-white">Akaunti</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          <div className="bg-slate-800/40 rounded-xl p-3">
            <p className="text-[11px] text-slate-500 mb-0.5">Barua Pepe</p>
            <p className="text-sm text-white truncate">{email}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3">
            <p className="text-[11px] text-slate-500 mb-0.5">Wadhifa</p>
            <p className="text-sm text-emerald-400 font-medium">{ROLE_LABELS[profile.role] ?? profile.role}</p>
          </div>
          {profile.member_code && (
            <div className="bg-slate-800/40 rounded-xl p-3">
              <p className="text-[11px] text-slate-500 mb-0.5">Code ya Mwanachama</p>
              <p className="text-sm text-white font-mono">{profile.member_code}</p>
            </div>
          )}
        </div>
      </section>

      {/* Profile */}
      <section className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-white">Wasifu Wangu</h3>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input
            label="Jina Kamili"
            name="full_name"
            type="text"
            defaultValue={profile.full_name}
            required
            suffix={<User className="w-4 h-4" />}
          />
          <Input
            label="Namba ya Simu"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ''}
            placeholder="0712 345 678"
            suffix={<Phone className="w-4 h-4" />}
          />
          {profileMsg && <Banner kind={profileMsg.kind} text={profileMsg.text} onClose={() => setProfileMsg(null)} />}
          <Button type="submit" loading={savingProfile} className="gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Hifadhi Mabadiliko
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-white">Badilisha Nywila</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Nywila ya Sasa"
            name="current_password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
          />
          <Input
            label="Nywila Mpya"
            name="new_password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="new-password"
            suffix={
              <button type="button" onClick={() => setShowPw(p => !p)} className="cursor-pointer text-slate-400 hover:text-slate-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="Rudia Nywila Mpya"
            name="confirm_password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="new-password"
          />
          {pwMsg && <Banner kind={pwMsg.kind} text={pwMsg.text} onClose={() => setPwMsg(null)} />}
          <Button type="submit" loading={savingPw} className="gap-1.5">
            <Lock className="w-4 h-4" />
            Badilisha Nywila
          </Button>
        </form>
      </section>
    </div>
  )
}
