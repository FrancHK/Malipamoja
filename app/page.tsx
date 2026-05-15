import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  BiBuildingHouse, BiGroup, BiWallet, BiCreditCard,
  BiShield, BiMobile, BiTrendingUp, BiCheckCircle,
  BiRightArrowAlt, BiLogIn, BiStar, BiLock,
  BiBarChart, BiGift, BiTime, BiGlobe
} from 'react-icons/bi'

export default async function LandingPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch { /* Supabase not configured */ }

  return (
    <div className="min-h-screen bg-[#060611] text-white overflow-x-hidden">

      {/* ── Animated background grid ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060611]/70 backdrop-blur-xl border-b border-slate-800/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40"
              style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
              <BiBuildingHouse className="text-white text-xl" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">MaliPamoja</p>
              <p className="text-[10px] text-emerald-400/70 leading-none mt-0.5">VICOBA Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/join"
              className="text-sm text-slate-400 hover:text-emerald-400 transition-colors px-4 py-2 rounded-xl hover:bg-emerald-500/5">
              Omba Kujiunga
            </Link>
            <Link href="/login"
              className="flex items-center gap-1.5 text-sm bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              <BiLogIn className="text-base" />
              Ingia
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 mb-8">
            <BiStar className="text-emerald-400 text-sm" />
            <span className="text-emerald-400 text-sm font-medium">Jukwaa Nambari 1 la VICOBA Tanzania</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
            Simamia Kikundi
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              kwa Akili
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            Mfumo wa kisasa wa VICOBA — michango, mikopo, wanachama, na taarifa zote mahali pamoja.
            Rahisi, salama, na wa haraka.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/join"
              className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 text-base w-full sm:w-auto justify-center">
              Anza Bure Leo
              <BiRightArrowAlt className="text-xl group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base w-full sm:w-auto justify-center backdrop-blur-sm">
              <BiLogIn className="text-lg" />
              Ingia Akaunti
            </Link>
          </div>

          {/* ── Floating stats cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { icon: BiGroup, value: 'Wanachama', sub: 'Bila Kikomo', color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', icon_color: 'text-violet-400' },
              { icon: BiWallet, value: 'Akiba', sub: 'Wakati Halisi', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', icon_color: 'text-emerald-400' },
              { icon: BiCreditCard, value: 'Mikopo', sub: 'Haraka', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', icon_color: 'text-amber-400' },
              { icon: BiMobile, value: 'SMS', sub: 'Otomatiki', color: 'from-sky-500/20 to-sky-600/10', border: 'border-sky-500/20', icon_color: 'text-sky-400' },
            ].map(({ icon: Icon, value, sub, color, border, icon_color }) => (
              <div key={value}
                className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 text-center hover:-translate-y-1 transition-transform duration-300`}>
                <Icon className={`text-2xl ${icon_color} mx-auto mb-2`} />
                <p className="text-white font-bold text-sm">{value}</p>
                <p className="text-slate-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Vipengele</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Kila Kitu Unachohitaji
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Zana zote za kisasa za kusimamia VICOBA yako
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: BiGroup,
                gradient: 'from-violet-500 to-purple-600',
                glow: 'shadow-violet-500/25',
                bg: 'from-violet-500/10 to-violet-600/5',
                border: 'border-violet-500/20 hover:border-violet-500/40',
                title: 'Usimamizi wa Wanachama',
                desc: 'Ongeza wanachama, toa codes za kipekee, na fuatilia kila mtu kwa urahisi.',
              },
              {
                icon: BiWallet,
                gradient: 'from-emerald-500 to-teal-600',
                glow: 'shadow-emerald-500/25',
                bg: 'from-emerald-500/10 to-emerald-600/5',
                border: 'border-emerald-500/20 hover:border-emerald-500/40',
                title: 'Rekodi za Michango',
                desc: 'Rekodi na ufuatilie michango ya kila mwezi au wiki kwa usahihi.',
              },
              {
                icon: BiCreditCard,
                gradient: 'from-amber-500 to-orange-600',
                glow: 'shadow-amber-500/25',
                bg: 'from-amber-500/10 to-amber-600/5',
                border: 'border-amber-500/20 hover:border-amber-500/40',
                title: 'Usimamizi wa Mikopo',
                desc: 'Simamia maombi ya mikopo, idhini, na malipo ya kurudisha.',
              },
              {
                icon: BiMobile,
                gradient: 'from-sky-500 to-blue-600',
                glow: 'shadow-sky-500/25',
                bg: 'from-sky-500/10 to-sky-600/5',
                border: 'border-sky-500/20 hover:border-sky-500/40',
                title: 'Taarifa za SMS',
                desc: 'Mwanachama anapokuwa amekubaliwa, SMS inatumwa moja kwa moja.',
              },
              {
                icon: BiShield,
                gradient: 'from-rose-500 to-pink-600',
                glow: 'shadow-rose-500/25',
                bg: 'from-rose-500/10 to-rose-600/5',
                border: 'border-rose-500/20 hover:border-rose-500/40',
                title: 'Usalama wa Hali ya Juu',
                desc: 'Kila mtumiaji ana jukumu lake. Data yako iko salama wakati wote.',
              },
              {
                icon: BiBarChart,
                gradient: 'from-teal-500 to-cyan-600',
                glow: 'shadow-teal-500/25',
                bg: 'from-teal-500/10 to-teal-600/5',
                border: 'border-teal-500/20 hover:border-teal-500/40',
                title: 'Takwimu za Wakati Halisi',
                desc: 'Dashboard inaonyesha jumla ya akiba, mikopo, na wanachama papo hapo.',
              },
            ].map(({ icon: Icon, gradient, glow, bg, border, title, desc }) => (
              <div key={title}
                className={`group relative bg-gradient-to-br ${bg} border ${border} rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${glow}`}>
                {/* 3D icon box */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg ${glow} group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 24px -4px var(--tw-shadow-color), inset 0 1px 0 rgba(255,255,255,0.2)` }}>
                  <Icon className="text-white text-2xl" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>

                {/* Shine effect */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-3xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Mtiririko</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Jinsi Inavyofanya Kazi</h2>
            <p className="text-slate-400 text-lg">Hatua 4 rahisi za kujiunga</p>
          </div>

          <div className="grid sm:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />

            {[
              { num: '01', icon: BiGift, emoji: '📝', title: 'Omba', desc: 'Chagua kundi na jaza fomu ya maombi', color: 'from-emerald-500 to-teal-500' },
              { num: '02', icon: BiTime, emoji: '⏳', title: 'Subiri', desc: 'Mwenyekiti atakagua ombi lako haraka', color: 'from-violet-500 to-purple-500' },
              { num: '03', icon: BiMobile, emoji: '📱', title: 'Pata SMS', desc: 'Code yako ya kipekee itatumwa', color: 'from-amber-500 to-orange-500' },
              { num: '04', icon: BiCheckCircle, emoji: '✅', title: 'Ingia', desc: 'Tumia code kuingia na angalia akaunti', color: 'from-sky-500 to-blue-500' },
            ].map(({ num, icon: Icon, title, desc, color }) => (
              <div key={num} className="text-center group">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                  style={{ boxShadow: '0 12px 30px -8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                  <Icon className="text-white text-3xl" />
                </div>
                <div className="text-xs text-slate-600 font-bold mb-1 font-mono">{num}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Majukumu</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Kila Mtu Ana Nafasi</h2>
            <p className="text-slate-400 text-lg">Dashboard tofauti kwa kila jukumu</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                gradient: 'from-amber-500 to-orange-600',
                glow: '0 20px 60px -10px rgba(245,158,11,0.3)',
                border: 'border-amber-500/20',
                bg: 'from-amber-500/10 to-transparent',
                icon: '👑',
                role: 'Mwenyekiti',
                tag: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                perms: ['Unda vikundi vipya', 'Kubali/kataa maombi', 'Unda wafanyakazi', 'Angalia takwimu zote'],
              },
              {
                gradient: 'from-sky-500 to-blue-600',
                glow: '0 20px 60px -10px rgba(14,165,233,0.3)',
                border: 'border-sky-500/20',
                bg: 'from-sky-500/10 to-transparent',
                icon: '💼',
                role: 'Wafanyakazi',
                tag: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                perms: ['Rekodi michango', 'Simamia mikopo', 'Angalia wanachama', 'Kagua maombi'],
              },
              {
                gradient: 'from-emerald-500 to-teal-600',
                glow: '0 20px 60px -10px rgba(16,185,129,0.3)',
                border: 'border-emerald-500/20',
                bg: 'from-emerald-500/10 to-transparent',
                icon: '👤',
                role: 'Mwanachama',
                tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                perms: ['Angalia michango yako', 'Omba mkopo', 'Fuatilia malipo', 'Angalia akiba ya kundi'],
              },
            ].map(({ gradient, glow, border, bg, icon, role, tag, perms }) => (
              <div key={role}
                className={`relative bg-gradient-to-b ${bg} border ${border} rounded-3xl p-7 hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                style={{ boxShadow: glow }}>
                {/* Top glow line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-60`} />

                <div className="text-4xl mb-4">{icon}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tag} mb-4 inline-block`}>{role}</span>
                <ul className="mt-4 space-y-2.5">
                  {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                        <BiCheckCircle className="text-white text-xs" />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security banner ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: BiLock, title: 'Data Imesimbwa', desc: 'SSL/TLS encryption kwa data yote', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: BiGlobe, title: 'Inapatikana Popote', desc: 'Tumia simu yoyote — Android au iPhone', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { icon: BiTime, title: 'Backup ya Kila Siku', desc: 'Data yako inalindwa kila wakati', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`flex items-center gap-4 ${bg} border rounded-2xl px-5 py-4`}>
                <Icon className={`text-3xl ${color} flex-shrink-0`} />
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-emerald-500/20 rounded-3xl p-12 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40"
                style={{ boxShadow: '0 20px 40px -8px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                <BiBuildingHouse className="text-white text-4xl" />
              </div>

              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Anza Leo <span className="text-emerald-400">Bure</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Jiunge na MaliPamoja na simamia kikundi chako cha VICOBA kwa ufanisi zaidi.
                Hakuna ada. Hakuna masharti.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/join"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5">
                  Omba Kujiunga Bure
                  <BiRightArrowAlt className="text-xl group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold px-10 py-4 rounded-2xl transition-all">
                  <BiLogIn className="text-lg" />
                  Ingia Akaunti
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <BiBuildingHouse className="text-white text-sm" />
            </div>
            <span className="text-slate-400 text-sm font-medium">MaliPamoja — VICOBA Digital Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/join" className="hover:text-emerald-400 transition-colors">Jiunge</Link>
            <Link href="/login" className="hover:text-emerald-400 transition-colors">Ingia</Link>
            <span>© 2026 MaliPamoja</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
