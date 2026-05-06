'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Pencil, Trash2, ExternalLink, Star, Calendar, Weight } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoffee, useDeleteCoffee } from '@/lib/hooks'

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
      if (coffee?.roasterId) {
        router.push(`/roasters/${coffee.roasterId}`)
      } else {
        router.push('/')
      }
    } catch {
      toast.error('Error al eliminar el café')
      setConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
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
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={coffee.roasterId ? `/roasters/${coffee.roasterId}` : '/'}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {coffee.roasterName ?? 'Tostadores'}
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{coffee.name}</h1>
          <div className="flex shrink-0 items-center gap-1">
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

        {coffee.roasterName && (
          <p className="text-sm text-muted-foreground">{coffee.roasterName}</p>
        )}

        {/* Rating */}
        {coffee.rating != null && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 ${i < Math.round(coffee.rating!) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              />
            ))}
            <span className="ml-1 text-sm font-medium">{coffee.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <dl className="space-y-2 text-sm">
        {coffee.origin && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Origen</dt>
            <dd>{coffee.origin}</dd>
          </div>
        )}
        {coffee.variety && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Variedad</dt>
            <dd>{coffee.variety}</dd>
          </div>
        )}
        {coffee.process && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Proceso</dt>
            <dd>
              <Badge variant="secondary">{coffee.process}</Badge>
            </dd>
          </div>
        )}
        {coffee.weightG != null && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Peso</dt>
            <dd className="flex items-center gap-1">
              <Weight className="size-3.5 text-muted-foreground" />
              {coffee.weightG} g
            </dd>
          </div>
        )}
        {priceEur && (
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">Precio</dt>
            <dd>{priceEur} €</dd>
          </div>
        )}
        {coffee.purchasedAt && (
          <div className="flex gap-2">
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
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Notas de cata</p>
          <div className="flex flex-wrap gap-1.5">
            {coffee.tastingNotes.map((note) => (
              <Badge key={note} variant="outline">
                {note}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {coffee.review && (
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Reseña</p>
          <p className="text-sm leading-relaxed">{coffee.review}</p>
        </div>
      )}

      {/* CTA */}
      {coffee.productUrl && (
        <a
          href={coffee.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          <ExternalLink className="size-4" />
          Ver en la web
        </a>
      )}
    </div>
  )
}
