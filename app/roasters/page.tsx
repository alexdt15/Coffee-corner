'use client'

import Link from 'next/link'
import { Plus, Star, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRoasters } from '@/lib/hooks'

export default function RoastersPage() {
  const { data: roasters, isLoading, error } = useRoasters()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Error al cargar tostadores. Intenta recargar la página.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tostadores</h1>
        <Link href="/roasters/new" className={buttonVariants({ size: 'sm' })}>
          <Plus className="size-4" />
          Nuevo
        </Link>
      </div>

      {roasters?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">Aún no hay tostadores.</p>
          <Link
            href="/roasters/new"
            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-4')}
          >
            Añade el primero
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roasters?.map((roaster) => (
          <Link key={roaster.id} href={`/roasters/${roaster.id}`} className="group">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{roaster.name}</CardTitle>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                {roaster.country && (
                  <p className="text-sm text-muted-foreground">{roaster.country}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {roaster.coffeeCount}{' '}
                    {Number(roaster.coffeeCount) === 1 ? 'café' : 'cafés'}
                  </span>
                  {roaster.avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-primary text-primary" />
                      {parseFloat(roaster.avgRating).toFixed(1)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
