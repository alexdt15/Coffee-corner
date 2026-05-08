'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { RoasterCard, RoasterCardSkeleton } from '@/components/roaster-card'
import { useRoasters } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { RoasterWithStats } from '@/lib/hooks'

function filterRoasters(roasters: RoasterWithStats[], q: string): RoasterWithStats[] {
  if (!q) return roasters
  const needle = q.toLowerCase()
  return roasters.filter((r) => {
    const haystack = [r.name, r.country, r.notes].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(needle)
  })
}

function RoastersContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const { data: roasters, isLoading, error } = useRoasters()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <RoasterCardSkeleton key={i} />
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

  const filtered = filterRoasters(roasters ?? [], q)

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
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

      {roasters && roasters.length > 0 && filtered.length === 0 && q && (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-sm text-muted-foreground">Sin resultados para esa búsqueda.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((roaster) => (
          <RoasterCard key={roaster.id} roaster={roaster} />
        ))}
      </div>
    </>
  )
}

export default function RoastersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <RoasterCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <RoastersContent />
    </Suspense>
  )
}
