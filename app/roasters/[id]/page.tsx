'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2, ExternalLink, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useRoaster, useCoffees, useDeleteRoaster } from '@/lib/hooks'

export default function RoasterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: roaster, isLoading: loadingRoaster } = useRoaster(id)
  const { data: coffees, isLoading: loadingCoffees } = useCoffees({ roasterId: id })
  const deleteRoaster = useDeleteRoaster()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    try {
      await deleteRoaster.mutateAsync(id)
      toast.success('Tostador eliminado')
      router.push('/roasters')
    } catch {
      toast.error('Error al eliminar el tostador')
      setConfirming(false)
    }
  }

  if (loadingRoaster) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!roaster) {
    return <p className="text-sm text-destructive">Tostador no encontrado.</p>
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/roasters" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Tostadores
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold leading-tight">{roaster.name}</h1>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href={`/roasters/${id}/edit`}
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
                  disabled={deleteRoaster.isPending}
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
        {roaster.country && (
          <p className="text-sm text-muted-foreground">{roaster.country}</p>
        )}
        {roaster.websiteUrl && (
          <a
            href={roaster.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="size-3.5" />
            {roaster.websiteUrl.replace(/^https?:\/\//, '')}
          </a>
        )}
        {roaster.notes && (
          <p className="text-sm text-muted-foreground pt-1">{roaster.notes}</p>
        )}
      </div>

      {/* Coffees section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Cafés</h2>
          <Link
            href={`/coffees/new?roasterId=${id}`}
            className={buttonVariants({ size: 'sm' })}
          >
            <Plus className="size-4" />
            Añadir
          </Link>
        </div>

        {loadingCoffees && (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {!loadingCoffees && coffees?.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">Sin cafés todavía.</p>
            <Link
              href={`/coffees/new?roasterId=${id}`}
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'mt-4')}
            >
              Añade el primero
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {coffees?.map((coffee) => (
            <Link key={coffee.id} href={`/coffees/${coffee.id}`} className="group block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate font-medium text-sm">{coffee.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {coffee.origin && (
                        <span className="text-xs text-muted-foreground">{coffee.origin}</span>
                      )}
                      {coffee.process && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {coffee.process}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-sm text-muted-foreground">
                    {coffee.rating != null && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {coffee.rating.toFixed(1)}
                      </span>
                    )}
                    {coffee.priceCents != null && (
                      <span className="text-xs">
                        {(coffee.priceCents / 100).toFixed(2)} €
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
