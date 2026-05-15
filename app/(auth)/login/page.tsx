'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Hash, Users, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

type Tab = 'staff' | 'member'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ── Staff login ────────────────────────────────────────────────────────────
  async function handleStaffLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hitilafu imetokea'
      setError(msg === 'Invalid login credentials' ? 'Barua pepe au nywila si sahihi' : msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Member login ───────────────────────────────────────────────────────────
  async function handleMemberLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const code = (fd.get('code') as string).trim().toUpperCase()

    try {
      const res = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/member/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hitilafu imetokea')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
        <span className="font-bold text-white text-lg">MaliPamoja</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Karibu tena</h2>
        <p className="text-slate-400 text-sm mt-1">Ingiza taarifa zako ili uendelee</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800/60 rounded-xl p-1 mb-6 gap-1">
        <button
          type="button"
          onClick={() => { setTab('staff'); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            tab === 'staff'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Wafanyakazi
        </button>
        <button
          type="button"
          onClick={() => { setTab('member'); setError('') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            tab === 'member'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Mwanachama
        </button>
      </div>

      {/* ── Staff form ── */}
      {tab === 'staff' && (
        <form onSubmit={handleStaffLogin} className="space-y-4">
          <Input
            label="Barua Pepe"
            name="email"
            type="email"
            placeholder="wewe@mfano.com"
            required
            autoComplete="email"
            suffix={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Nywila"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            suffix={
              <button type="button" onClick={() => setShowPassword(p => !p)} className="cursor-pointer text-slate-400 hover:text-slate-200">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30" />
              Nikumbuke
            </label>
            <Link href="/forgot-password" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Umesahau nywila?
            </Link>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full h-11 text-base mt-2">
            Ingia
          </Button>
        </form>
      )}

      {/* ── Member form ── */}
      {tab === 'member' && (
        <form onSubmit={handleMemberLogin} className="space-y-4">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 mb-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              Wanachama wanaoingia kwa mara ya kwanza wanapata code yao kupitia <span className="text-emerald-400">WhatsApp</span> baada ya ombi lao kukubaliwa.
            </p>
          </div>

          <Input
            label="Code ya Mwanachama"
            name="code"
            type="text"
            placeholder="Mfano: AMI001"
            required
            autoComplete="off"
            suffix={<Hash className="w-4 h-4" />}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full h-11 text-base mt-2">
            Ingia kama Mwanachama
          </Button>

          <p className="text-center text-sm text-slate-400">
            Bado hujajiunga?{' '}
            <Link href="/join" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Omba kujiunga →
            </Link>
          </p>
        </form>
      )}

      {/* Divider (staff only) */}
      {tab === 'staff' && (
        <>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">au</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-400 text-center">
              Demo: <span className="text-emerald-400 font-mono">demo@malipamoja.co.tz</span> / <span className="text-emerald-400 font-mono">demo1234</span>
            </p>
          </div>

          <p className="text-center text-sm text-slate-300">
            Bado huna akaunti?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Jisajili bure
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
