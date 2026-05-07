'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { CoffeeCard, CoffeeCardSkeleton } from '@/components/coffee-card'
import { FilterSheet, type FilterValues } from '@/components/filter-sheet'
import { useCoffees, useCoffeeFilterOptions } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import type { CoffeeWithRoaster } from '@/lib/hooks'

function filterCoffees(
  coffees: CoffeeWithRoaster[],
  q: string,
  filters: FilterValues,
): CoffeeWithRoaster[] {
  return coffees.filter((coffee) => {
    if (q) {
      const needle = q.toLowerCase()
      const haystack = [
        coffee.name,
        coffee.origin,
        coffee.variety,
        coffee.process,
        coffee.review,
        coffee.roasterName,
        ...(coffee.tastingNotes ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    if (filters.origins.length > 0 && !filters.origins.includes(coffee.origin ?? '')) return false
    if (filters.processes.length > 0 && !filters.processes.includes(coffee.process ?? '')) return false
    if (filters.minRating != null && (coffee.rating == null || coffee.rating < filters.minRating))
      return false
    return true
  })
}

function parseFilters(searchParams: ReturnType<typeof useSearchParams>): FilterValues {
  const origins = searchParams.get('origin')?.split(',').filter(Boolean) ?? []
  const processes = searchParams.get('process')?.split(',').filter(Boolean) ?? []
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null
  return { origins, processes, minRating }
}

function CoffeesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)

  const q = searchParams.get('q') ?? ''
  const filters = parseFilters(searchParams)
  const activeFilterCount =
    filters.origins.length + filters.processes.length + (filters.minRating != null ? 1 : 0)

  const { data: coffees, isLoading, error } = useCoffees()
  const filterOptions = useCoffeeFilterOptions()

  const sorted = coffees
    ?.slice()
    .sort((a, b) => {
      if (a.rating == null && b.rating == null) return 0
      if (a.rating == null) return 1
      if (b.rating == null) return -1
      return b.rating - a.rating
    }) ?? []

  const filtered = filterCoffees(sorted, q, filters)

  function applyFilters(values: FilterValues) {
    const params = new URLSearchParams(searchParams.toString())
    if (values.origins.length > 0) params.set('origin', values.origins.join(','))
    else params.delete('origin')
    if (values.processes.length > 0) params.set('process', values.processes.join(','))
    else params.delete('process')
    if (values.minRating != null) params.set('minRating', String(values.minRating))
    else params.delete('minRating')
    const qs = params.toString()
    router.replace(`/${qs ? `?${qs}` : ''}`)
  }

  function removeOrigin(origin: string) {
    applyFilters({ ...filters, origins: filters.origins.filter((o) => o !== origin) })
  }

  function removeProcess(process: string) {
    applyFilters({ ...filters, processes: filters.processes.filter((p) => p !== process) })
  }

  function removeMinRating() {
    applyFilters({ ...filters, minRating: null })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CoffeeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">Error al cargar cafés. Intenta recargar.</p>
  }

  return (
    <>
      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        options={filterOptions}
        current={filters}
        onApply={applyFilters}
      />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tus cafés</h1>
        <Link href="/coffees/new" className={buttonVariants({ size: 'sm' })}>
          <Plus className="size-4" />
          Añadir
        </Link>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilterOpen(true)}
          className={cn(
            'h-8 gap-1.5 text-xs font-medium',
            activeFilterCount > 0 && 'border-primary text-primary',
          )}
        >
          <SlidersHorizontal className="size-3.5 stroke-[1.5]" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {filters.origins.map((o) => (
          <ActiveChip key={o} label={o} onRemove={() => removeOrigin(o)} />
        ))}
        {filters.processes.map((p) => (
          <ActiveChip key={p} label={p} onRemove={() => removeProcess(p)} />
        ))}
        {filters.minRating != null && (
          <ActiveChip label={`★ ${filters.minRating}+`} onRemove={removeMinRating} />
        )}
      </div>

      {/* Empty states */}
      {coffees?.length === 0 && (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-sm text-muted-foreground">Aún no tienes cafés.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ve a un tostador y añade tu primer café.
          </p>
        </div>
      )}

      {coffees && coffees.length > 0 && filtered.length === 0 && (q || activeFilterCount > 0) && (
        <div className="flex flex-col items-center py-24 text-center">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0 ? 'Ningún café coincide con los filtros.' : 'Sin resultados para esa búsqueda.'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={() => applyFilters({ origins: [], processes: [], minRating: null })}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((coffee) => (
          <CoffeeCard key={coffee.id} coffee={coffee} />
        ))}
      </div>
    </>
  )
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} className="ml-0.5 opacity-70 hover:opacity-100">
        <X className="size-3" />
      </button>
    </span>
  )
}

export default function CoffeesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CoffeeCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <CoffeesContent />
    </Suspense>
  )
}
