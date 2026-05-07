import { Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

function warmHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return (Math.abs(hash) % 50) + 15 // hue 15–65: oranges → warm yellows
}

interface CoffeeAvatarPlaceholderProps {
  id: string
  className?: string
  iconClassName?: string
}

export function CoffeeAvatarPlaceholder({ id, className, iconClassName }: CoffeeAvatarPlaceholderProps) {
  const h = warmHue(id)
  const from = `hsl(${h}, 28%, 86%)`
  const to = `hsl(${h + 15}, 22%, 78%)`

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-2xl', className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <Coffee className={cn('stroke-[1.5] opacity-40', iconClassName)} />
    </div>
  )
}
