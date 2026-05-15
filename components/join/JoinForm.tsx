'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, Phone, Hash, Briefcase, FileText, Send, CheckCircle, Users, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'

interface Group {
  id: string
  name: string
  description: string | null
  contribution_amount: number
  contribution_cycle: string
}

export function JoinForm({ groups }: { groups: Group[] }) {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [step, setStep] = useState<'group' | 'form'>('group')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('full_name'),
          phone: fd.get('phone'),
          id_number: fd.get('id_number'),
          occupation: fd.get('occupation'),
          reason: fd.get('reason'),
          group_id: selectedGroup?.id ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Hitilafu imetokea')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hitilafu imetokea. Jaribu tena.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[#080815] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ombi Limetumwa!</h2>
          {selectedGroup && (
            <p className="text-slate-400 text-sm mb-2">
              Umeomba kujiunga na kundi la <span className="text-white font-medium">{selectedGroup.name}</span>.
            </p>
          )}
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Mwenyekiti atakagua ombi lako. Ukikubaliwa, utapata code yako ya kuingia kupitia <span className="text-emerald-400">WhatsApp</span>.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Rudi Ukurasa wa Kuingia
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080815] flex">
      {/* Left branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-r border-slate-800/60 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">MaliPamoja</p>
            <p className="text-xs text-slate-500 mt-0.5">VICOBA Digital Platform</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Jiunge na <span className="text-emerald-400">familia</span> yetu
            </h1>
            <p className="text-slate-400 mt-4 text-base leading-relaxed">
              Chagua kundi, jaza fomu, na subiri idhini ya Mwenyekiti. Ukikubaliwa, code yako itatumwa kwa WhatsApp.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '👥', text: 'Chagua kundi unalotaka kujiunga' },
              { icon: '📝', text: 'Jaza taarifa zako za kibinafsi' },
              { icon: '⏳', text: 'Subiri idhini ya Mwenyekiti' },
              { icon: '📱', text: 'Pata code yako kwa WhatsApp' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">
          Una akaunti tayari?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300">Ingia hapa</Link>
        </p>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="font-bold text-white text-lg">MaliPamoja</span>
          </div>

          {/* ── Step 1: Choose group ── */}
          {step === 'group' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">Chagua Kundi</h2>
                <p className="text-slate-400 text-sm mt-2">Chagua kundi unalotaka kujiunga</p>
              </div>

              {groups.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-8 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Hakuna vikundi vilivyoundwa bado.</p>
                  <p className="text-slate-500 text-xs mt-1">Wasiliana na msimamizi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => { setSelectedGroup(group); setStep('form') }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 group ${
                        selectedGroup?.id === group.id
                          ? 'bg-emerald-500/10 border-emerald-500/40'
                          : 'bg-slate-900 border-slate-800/60 hover:border-emerald-500/30 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            selectedGroup?.id === group.id ? 'bg-emerald-500' : 'bg-slate-800 group-hover:bg-emerald-500/20'
                          }`}>
                            <Users className={`w-5 h-5 ${selectedGroup?.id === group.id ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{group.name}</p>
                            {group.description && (
                              <p className="text-slate-500 text-xs mt-0.5 truncate">{group.description}</p>
                            )}
                            <p className="text-emerald-400 text-xs mt-1 font-medium">
                              {formatCurrency(group.contribution_amount)}{' '}
                              <span className="text-slate-500">
                                / {group.contribution_cycle === 'monthly' ? 'mwezi' : 'wiki'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-sm text-slate-400 mt-6">
                Una akaunti tayari?{' '}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Ingia hapa</Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Fill form ── */}
          {step === 'form' && selectedGroup && (
            <div>
              {/* Back + selected group */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => { setStep('group'); setError('') }}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  ← Rudi
                </button>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 text-sm font-medium truncate">{selectedGroup.name}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Taarifa Zako</h2>
                <p className="text-slate-400 text-sm mt-1">Jaza fomu hii ili kuwasilisha ombi lako</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Jina Kamili *"
                  name="full_name"
                  placeholder="Amina Johari"
                  required
                  suffix={<User className="w-4 h-4" />}
                />
                <Input
                  label="Nambari ya WhatsApp *"
                  name="phone"
                  type="tel"
                  placeholder="+255 7XX XXX XXX"
                  required
                  suffix={<Phone className="w-4 h-4" />}
                />
                <Input
                  label="Nambari ya Kitambulisho (si lazima)"
                  name="id_number"
                  placeholder="NIDA / Passport"
                  suffix={<Hash className="w-4 h-4" />}
                />
                <Input
                  label="Kazi / Biashara (si lazima)"
                  name="occupation"
                  placeholder="Mfano: Mkulima, Mfanyabiashara"
                  suffix={<Briefcase className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Sababu ya Kutaka Kujiunga (si lazima)
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    placeholder="Niambie kwa ufupi kwa nini unataka kujiunga..."
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 resize-none transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full h-11 text-base gap-2">
                  <Send className="w-4 h-4" />
                  Tuma Ombi
                </Button>
              </form>

              <p className="text-center text-sm text-slate-400 mt-5">
                Una akaunti tayari?{' '}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Ingia hapa</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
