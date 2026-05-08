'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, ExternalLink, Star, Calendar, Weight } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CoffeeAvatarPlaceholder } from '@/components/coffee-avatar-placeholder'
import { useCoffee, useDeleteCoffee } from '@/lib/hooks'
import { cn } from '@/lib/utils'

export default function CoffeePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: coffee, isLoading } = useCoffee(id)
  const deleteCoffee = useDeleteCoffee()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    try {
      await deleteCoffee.mutateAsync(id)
      toast.success('Café eliminado')
      router.push(coffee?.roasterId ? `/roasters/${coffee.roasterId}` : '/')
    } catch {
      toast.error('Error al eliminar el café')
      setConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-col items-center gap-3 py-4">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!coffee) {
    return <p className="text-sm text-destructive">Café no encontrado.</p>
  }

  const priceEur = coffee.priceCents != null ? (coffee.priceCents / 100).toFixed(2) : null

  return (
    <div className="space-y-8">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <Link
          href={coffee.roasterId ? `/roasters/${coffee.roasterId}` : '/'}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {coffee.roasterName ?? 'Tostadores'}
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={`/coffees/${id}/edit`}
            className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          >
            <Pencil className="size-3.5" />
          </Link>
          {confirming ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="xs"
                onClick={handleDelete}
                disabled={deleteCoffee.isPending}
              >
                Confirmar
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <CoffeeAvatarPlaceholder id={id} className="h-24 w-24" iconClassName="size-9" />
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold leading-tight">{coffee.name}</h1>
          {coffee.roasterName && (
            <p className="text-sm text-muted-foreground">{coffee.roasterName}</p>
          )}
        </div>
        {coffee.rating != null && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 ${
                  i < Math.round(coffee.rating!)
                    ? 'fill-primary stroke-none'
                    : 'fill-none stroke-muted-foreground/30'
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-muted-foreground">{coffee.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <dl className="divide-y divide-border text-sm">
        {coffee.origin && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Origen</dt>
            <dd>{coffee.origin}</dd>
          </div>
        )}
        {coffee.variety && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Variedad</dt>
            <dd>{coffee.variety}</dd>
          </div>
        )}
        {coffee.process && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Proceso</dt>
            <dd>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                {coffee.process}
              </span>
            </dd>
          </div>
        )}
        {coffee.weightG != null && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Peso</dt>
            <dd className="flex items-center gap-1">
              <Weight className="size-3.5 text-muted-foreground" />
              {coffee.weightG} g
            </dd>
          </div>
        )}
        {priceEur && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Precio</dt>
            <dd>{priceEur} €</dd>
          </div>
        )}
        {coffee.purchasedAt && (
          <div className="flex items-center gap-2 py-2.5">
            <dt className="w-28 shrink-0 text-muted-foreground">Comprado</dt>
            <dd className="flex items-center gap-1">
              <Calendar className="size-3.5 text-muted-foreground" />
              {coffee.purchasedAt}
            </dd>
          </div>
        )}
      </dl>

      {/* Tasting notes */}
      {coffee.tastingNotes && coffee.tastingNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Notas de cata
          </p>
          <div className="flex flex-wrap gap-1.5">
            {coffee.tastingNotes.map((note) => (
              <span
                key={note}
                className="rounded-full bg-golden px-3 py-1 text-sm text-primary-foreground"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {coffee.review && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reseña
          </p>
          <blockquote className="border-l-2 border-primary/40 pl-4 text-sm italic leading-relaxed text-foreground/80">
            {coffee.review}
          </blockquote>
        </div>
      )}

      {/* CTA */}
      {coffee.productUrl && (
        <a
          href={coffee.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
        >
          <ExternalLink className="size-4" />
          Ver en la web
        </a>
      )}
    </div>
  )
}
