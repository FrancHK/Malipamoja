import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'violet'

const variants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  danger:  'bg-red-500/15 text-red-400 border border-red-500/20',
  info:    'bg-sky-500/15 text-sky-400 border border-sky-500/20',
  neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
  violet:  'bg-violet-500/15 text-violet-400 border border-violet-500/20',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full',
        variant === 'success' ? 'bg-emerald-400' :
        variant === 'warning' ? 'bg-amber-400' :
        variant === 'danger'  ? 'bg-red-400' :
        variant === 'info'    ? 'bg-sky-400' :
        variant === 'violet'  ? 'bg-violet-400' : 'bg-slate-400'
      )} />}
      {children}
    </span>
  )
}

export function contributionStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = { paid: 'success', pending: 'warning', late: 'danger' }
  const labels: Record<string, string> = { paid: 'Imelipwa', pending: 'Inasubiri', late: 'Imechelewa' }
  return <Badge variant={map[status] ?? 'neutral'} dot>{labels[status] ?? status}</Badge>
}

export function loanStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    pending: 'warning', approved: 'info', rejected: 'danger',
    active: 'success', completed: 'neutral',
  }
  const labels: Record<string, string> = {
    pending: 'Inasubiri', approved: 'Imeidhinishwa', rejected: 'Imekataliwa',
    active: 'Inaendelea', completed: 'Imekamilika',
  }
  return <Badge variant={map[status] ?? 'neutral'} dot>{labels[status] ?? status}</Badge>
}

export function roleBadge(role: string) {
  const map: Record<string, BadgeVariant> = { admin: 'violet', treasurer: 'info', member: 'neutral' }
  const labels: Record<string, string> = { admin: 'Admin', treasurer: 'Msimamizi', member: 'Mwanachama' }
  return <Badge variant={map[role] ?? 'neutral'}>{labels[role] ?? role}</Badge>
}
