export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800/60">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-800 rounded-lg" />
          <div className="h-3 w-48 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block h-9 w-44 bg-slate-800 rounded-xl" />
          <div className="h-9 w-9 bg-slate-800 rounded-xl" />
          <div className="h-9 w-9 bg-slate-800 rounded-full" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-slate-900 border border-slate-800/60 rounded-2xl p-5 ${i === 0 ? 'col-span-2 xl:col-span-2' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-slate-800 rounded" />
                  <div className="h-7 w-24 bg-slate-800 rounded-lg mt-2" />
                </div>
                <div className="w-11 h-11 bg-slate-800 rounded-xl flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800/60 rounded-2xl">
            <div className="p-5 border-b border-slate-800/60">
              <div className="h-5 w-44 bg-slate-800 rounded-lg" />
            </div>
            <div className="divide-y divide-slate-800/60">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 bg-slate-800 rounded-xl flex-shrink-0" />
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-36 bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-800/60 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 h-40" />
            <div className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5 h-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
