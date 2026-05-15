'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const full_name = fd.get('full_name') as string
    const email = fd.get('email') as string
    const phone = fd.get('phone') as string
    const password = fd.get('password') as string
    const confirm = fd.get('confirm_password') as string

    if (password !== confirm) {
      setError('Nywila hazifanani')
      setLoading(false)
      return
    }
    if (password.length < 8) {
      setError('Nywila lazima iwe na herufi 8 au zaidi')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone } },
      })
      if (authError) throw authError
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hitilafu imetokea')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Umefanikiwa Kujisajili!</h2>
        <p className="text-slate-400 text-sm">Angalia barua pepe yako kwa ajili ya uhakikisho. Utaelekezwa kwenye ukurasa wa kuingia...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex items-center gap-3 mb-8 lg:hidden">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold">M</span>
        </div>
        <span className="font-bold text-white text-lg">MaliPamoja</span>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Unda Akaunti</h2>
        <p className="text-slate-400 text-sm mt-2">Jiunge na maelfu ya watumiaji wanaotunza fedha zao kwa akili</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Jina Kamili"
          name="full_name"
          placeholder="Amina Johari"
          required
          autoComplete="name"
          suffix={<User className="w-4 h-4" />}
        />
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
          label="Nambari ya Simu (si lazima)"
          name="phone"
          type="tel"
          placeholder="+255 7XX XXX XXX"
          autoComplete="tel"
          suffix={<Phone className="w-4 h-4" />}
        />
        <Input
          label="Nywila"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Angalau herufi 8"
          required
          autoComplete="new-password"
          suffix={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="cursor-pointer text-slate-400 hover:text-slate-200">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <Input
          label="Thibitisha Nywila"
          name="confirm_password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Rudia nywila"
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <p className="text-xs text-slate-500">
          Kwa kujiandikisha unakubali{' '}
          <span className="text-emerald-400 cursor-pointer">masharti ya matumizi</span> na{' '}
          <span className="text-emerald-400 cursor-pointer">sera ya faragha</span>.
        </p>

        <Button type="submit" loading={loading} className="w-full h-11 text-base">
          Jisajili Sasa
        </Button>
      </form>

      <p className="text-center text-sm text-slate-300 mt-6">
        Una akaunti tayari?{' '}
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
          Ingia hapa
        </Link>
      </p>
    </div>
  )
}
