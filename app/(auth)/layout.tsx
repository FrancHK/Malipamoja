export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080815] flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-r border-slate-800/60 p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <p className="font-bold text-white text-lg leading-none">MaliPamoja</p>
            <p className="text-xs text-slate-500 mt-0.5">VICOBA Digital Platform</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Akiba yako, <span className="text-emerald-400">nguvu yako</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              Simamia vikundi vyako vya VICOBA kwa urahisi. Fuatilia michango, mikopo, na ukuaji wa fedha kwa wakati halisi.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-4">
            {[
              { icon: '💰', text: 'Fuatilia michango ya kila mwanachama' },
              { icon: '📊', text: 'Ripoti za fedha zenye uwazi kamili' },
              { icon: '🔐', text: 'Usalama wa kiwango cha benki' },
              { icon: '📱', text: 'Inapatikana simu na kompyuta' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/30">
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;MaliPamoja imesaidia kundi letu kuongeza akiba kwa 40% ndani ya miezi sita. Sasa tunajua kila shilingi iko wapi.&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">AJ</div>
            <div>
              <p className="text-white text-xs font-semibold">Amina Johari</p>
              <p className="text-slate-500 text-xs">Kiongozi, Umoja Savings Group</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex-1 flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  )
}
