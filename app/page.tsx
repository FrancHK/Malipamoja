import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Users, PiggyBank, CreditCard, Shield, Smartphone,
  TrendingUp, CheckCircle, ArrowRight, ChevronRight
} from 'lucide-react'

export default async function LandingPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch { /* Supabase not configured */ }

  return (
    <div className="min-h-screen bg-[#080815] text-white">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080815]/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-white text-lg">MaliPamoja</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/join"
              className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Omba Kujiunga
            </Link>
            <Link
              href="/login"
              className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              Ingia
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Jukwaa la VICOBA la Kisasa</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Simamia Kikundi Chako
            <span className="block text-emerald-400 mt-1">kwa Urahisi</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            MaliPamoja ni mfumo wa kidijitali wa VICOBA unaokuwezesha kusimamia wanachama,
            michango, mikopo, na taarifa zote mahali pamoja — kwa wakati halisi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-base w-full sm:w-auto justify-center"
            >
              Omba Kujiunga Bure
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base w-full sm:w-auto justify-center"
            >
              Ingia Akaunti
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-6 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '100%', label: 'Salama & Imara' },
            { value: 'SMS', label: 'Taarifa za Papo Hapo' },
            { value: '24/7', label: 'Inapatikana Wakati Wote' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl sm:text-4xl font-bold text-emerald-400">{value}</p>
              <p className="text-slate-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Kila Kitu Unachohitaji
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Vipengele vyote vya kusimamia VICOBA yako kwa ufanisi
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10 border-violet-500/20',
                title: 'Usimamizi wa Wanachama',
                desc: 'Ongeza, hariri na fuatilia wanachama wote wa kikundi chako kwa urahisi. Kila mwanachama ana code yake ya kipekee.',
              },
              {
                icon: PiggyBank,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Rekodi za Michango',
                desc: 'Rekodi michango ya kila mwezi au wiki. Angalia takwimu za akiba za kikundi kwa wakati halisi.',
              },
              {
                icon: CreditCard,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                title: 'Usimamizi wa Mikopo',
                desc: 'Simamia maombi ya mikopo, idhini, na malipo ya kurudisha kwa njia rahisi na ya haraka.',
              },
              {
                icon: Smartphone,
                color: 'text-sky-400',
                bg: 'bg-sky-500/10 border-sky-500/20',
                title: 'Taarifa za SMS',
                desc: 'Mwanachama anapokuwa amekubaliwa, SMS inatumwa moja kwa moja kwa nambari yake ya simu.',
              },
              {
                icon: Shield,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10 border-rose-500/20',
                title: 'Usalama wa Hali ya Juu',
                desc: 'Kila mtumiaji ana jukumu lake. Mwenyekiti, Katibu, Mweka Hazina — kila mmoja ana uwezo wake tu.',
              },
              {
                icon: TrendingUp,
                color: 'text-teal-400',
                bg: 'bg-teal-500/10 border-teal-500/20',
                title: 'Takwimu za Wakati Halisi',
                desc: 'Dashboard inaonyesha jumla ya akiba, mikopo hai, wanachama, na maombi yanayosubiri.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="bg-slate-900 border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl border ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Jinsi Inavyofanya Kazi
            </h2>
            <p className="text-slate-400 text-lg">Hatua rahisi za kujiunga na kikundi</p>
          </div>

          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📝', title: 'Jaza Fomu', desc: 'Chagua kundi na jaza taarifa zako za kibinafsi' },
              { step: '02', icon: '⏳', title: 'Subiri Idhini', desc: 'Mwenyekiti atakagua ombi lako' },
              { step: '03', icon: '📱', title: 'Pata SMS', desc: 'Code yako ya kipekee itatumwa kwa WhatsApp/SMS' },
              { step: '04', icon: '✅', title: 'Ingia Mfumo', desc: 'Tumia code yako kuingia na angalia akaunti yako' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {icon}
                </div>
                <div className="text-xs text-emerald-500 font-bold mb-1">{step}</div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Majukumu Mbalimbali</h2>
            <p className="text-slate-400 text-lg">Kila mtu ana dashboard yake kulingana na jukumu lake</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                emoji: '👑',
                role: 'Mwenyekiti',
                color: 'border-amber-500/30 bg-amber-500/5',
                badge: 'bg-amber-500/10 text-amber-400',
                perms: ['Unda vikundi vipya', 'Kubali/kataa maombi', 'Unda wafanyakazi', 'Angalia takwimu zote'],
              },
              {
                emoji: '💼',
                role: 'Wafanyakazi',
                color: 'border-sky-500/30 bg-sky-500/5',
                badge: 'bg-sky-500/10 text-sky-400',
                perms: ['Rekodi michango', 'Simamia mikopo', 'Angalia wanachama', 'Kagua maombi'],
              },
              {
                emoji: '👤',
                role: 'Mwanachama',
                color: 'border-emerald-500/30 bg-emerald-500/5',
                badge: 'bg-emerald-500/10 text-emerald-400',
                perms: ['Angalia michango yako', 'Omba mkopo', 'Fuatilia malipo', 'Angalia akiba'],
              },
            ].map(({ emoji, role, color, badge, perms }) => (
              <div key={role} className={`rounded-2xl border p-6 ${color}`}>
                <div className="text-3xl mb-3">{emoji}</div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>{role}</span>
                <ul className="mt-4 space-y-2">
                  {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
              <span className="text-white font-bold text-3xl">M</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Anza Leo Bure</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Jiunge na MaliPamoja na simamia kikundi chako cha VICOBA kwa ufanisi zaidi.
              Hakuna ada ya kuanza.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/join"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
              >
                Omba Kujiunga
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
              >
                Ingia Akaunti
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-slate-400 text-sm">MaliPamoja — VICOBA Digital Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/join" className="hover:text-slate-400 transition-colors">Jiunge</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Ingia</Link>
            <span>© 2026 MaliPamoja</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
