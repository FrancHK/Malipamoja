import { getInitials, cn } from '@/lib/utils'

const COLORS = [
  'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
]

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

interface AvatarProps {
  name: string
  imageUrl?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }

export function Avatar({ name, imageUrl, size = 'md', className }: AvatarProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={name} className={cn('rounded-full object-cover ring-2 ring-slate-700', sizes[size], className)} />
    )
  }
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-slate-700', colorFor(name), sizes[size], className)}>
      {getInitials(name)}
    </div>
  )
}
