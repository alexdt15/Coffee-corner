'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CoffeeCard, CoffeeCardSkeleton } from '@/components/coffee-card'
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
      <div className="space-y-8">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <CoffeeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!roaster) {
    return <p className="text-sm text-destructive">Tostador no encontrado.</p>
  }

  return (
    <div className="space-y-8">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <Link
          href="/roasters"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Tostadores
        </Link>

        <div className="flex items-center gap-1">
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

      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold leading-tight">{roaster.name}</h1>
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
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{roaster.notes}</p>
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
              <CoffeeCardSkeleton key={i} />
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

        <div className="space-y-3">
          {coffees?.map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee} />
          ))}
        </div>
      </div>
    </div>
  )
}
