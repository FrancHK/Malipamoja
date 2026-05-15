export default function MemberLoading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800/60">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-800 rounded-lg" />
          <div className="h-3 w-40 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="h-9 w-9 bg-slate-800 rounded-full" />
      </div>
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-2xl p-5">
              <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
              <div className="h-7 w-28 bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800/60 rounded-2xl h-48" />
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800/60 rounded-2xl h-48" />
        </div>
      </div>
    </div>
  )
}
