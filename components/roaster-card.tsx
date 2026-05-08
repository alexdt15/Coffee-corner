import Link from 'next/link'
import { Star, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoasterWithStats } from '@/lib/hooks'

function roasterHue(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return (Math.abs(hash) % 40) + 70 // hue 70–110: warm yellows → olive greens
}

function RoasterAvatarPlaceholder({ id, className }: { id: string; className?: string }) {
  const h = roasterHue(id)
  const from = `hsl(${h}, 22%, 86%)`
  const to = `hsl(${h + 15}, 18%, 78%)`

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-2xl', className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <Store className="size-6 stroke-[1.5] opacity-40" />
    </div>
  )
}

interface RoasterCardProps {
  roaster: RoasterWithStats
}

export function RoasterCard({ roaster }: RoasterCardProps) {
  return (
    <Link href={`/roasters/${roaster.id}`} className="group block">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40">
        <RoasterAvatarPlaceholder id={roaster.id} className="h-16 w-16" />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium leading-snug">{roaster.name}</p>
            {roaster.avgRating && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="size-3.5 fill-primary stroke-none" />
                <span className="text-sm text-muted-foreground">
                  {parseFloat(roaster.avgRating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {roaster.country && (
            <p className="text-xs text-muted-foreground">{roaster.country}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              {roaster.coffeeCount} {Number(roaster.coffeeCount) === 1 ? 'café' : 'cafés'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function RoasterCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}
