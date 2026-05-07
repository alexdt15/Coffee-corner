'use client'

import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface FilterValues {
  origins: string[]
  processes: string[]
  minRating: number | null
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: { origins: string[]; processes: string[] }
  current: FilterValues
  onApply: (values: FilterValues) => void
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

const RATING_OPTIONS = [1, 2, 3, 4, 5]

export function FilterSheet({ open, onOpenChange, options, current, onApply }: FilterSheetProps) {
  const [draft, setDraft] = useState<FilterValues>(current)
  const prevOpenRef = useRef(false)

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    prevOpenRef.current = open
    if (justOpened) setDraft(current)
  }, [open, current])

  function toggleOrigin(origin: string) {
    setDraft((prev) => ({
      ...prev,
      origins: prev.origins.includes(origin)
        ? prev.origins.filter((o) => o !== origin)
        : [...prev.origins, origin],
    }))
  }

  function toggleProcess(process: string) {
    setDraft((prev) => ({
      ...prev,
      processes: prev.processes.includes(process)
        ? prev.processes.filter((p) => p !== process)
        : [...prev.processes, process],
    }))
  }

  function setMinRating(rating: number) {
    setDraft((prev) => ({
      ...prev,
      minRating: prev.minRating === rating ? null : rating,
    }))
  }

  function handleClear() {
    const empty: FilterValues = { origins: [], processes: [], minRating: null }
    setDraft(empty)
    onApply(empty)
    onOpenChange(false)
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  const hasChanges =
    draft.origins.length > 0 || draft.processes.length > 0 || draft.minRating != null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-5">
        <SheetHeader className="mb-5 text-left">
          <SheetTitle className="font-heading text-lg font-medium">Filtros</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {options.origins.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Origen
              </p>
              <div className="flex flex-wrap gap-2">
                {options.origins.map((origin) => (
                  <Chip
                    key={origin}
                    label={origin}
                    active={draft.origins.includes(origin)}
                    onClick={() => toggleOrigin(origin)}
                  />
                ))}
              </div>
            </section>
          )}

          {options.processes.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Proceso
              </p>
              <div className="flex flex-wrap gap-2">
                {options.processes.map((process) => (
                  <Chip
                    key={process}
                    label={process}
                    active={draft.processes.includes(process)}
                    onClick={() => toggleProcess(process)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Rating mínimo
            </p>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={cn(
                    'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    draft.minRating === r
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                  )}
                >
                  <Star className={cn('size-3', draft.minRating === r ? 'fill-primary-foreground stroke-none' : 'fill-muted-foreground stroke-none')} />
                  {r}+
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClear}
            disabled={!hasChanges}
          >
            Limpiar
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Ver resultados
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
