import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CoffeeAvatarPlaceholder } from '@/components/coffee-avatar-placeholder'
import type { CoffeeWithRoaster } from '@/lib/hooks'

interface CoffeeCardProps {
  coffee: CoffeeWithRoaster
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  return (
    <Link href={`/coffees/${coffee.id}`} className="group block">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/40">
        <CoffeeAvatarPlaceholder
          id={coffee.id}
          className="h-16 w-16"
          iconClassName="size-6"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium leading-snug">{coffee.name}</p>
            {coffee.rating != null && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="size-3.5 fill-primary stroke-none" />
                <span className="text-sm text-muted-foreground">{coffee.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {coffee.roasterName && (
            <p className="text-xs text-muted-foreground">{coffee.roasterName}</p>
          )}

          {(coffee.origin || coffee.process) && (
            <div className="flex flex-wrap gap-1.5">
              {coffee.origin && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {coffee.origin}
                </span>
              )}
              {coffee.process && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {coffee.process}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export function CoffeeCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/5 animate-pulse rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  )
}
