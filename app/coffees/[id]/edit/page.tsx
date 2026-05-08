'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { CoffeeForm, type CoffeeFormValues } from '@/components/coffee-form'
import { useCoffee, useUpdateCoffee } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'

function parseCoffeeForm(data: CoffeeFormValues) {
  return {
    name: data.name,
    origin: data.origin || null,
    variety: data.variety || null,
    process: data.process || null,
    priceCents: data.priceEur ? Math.round(parseFloat(data.priceEur) * 100) : null,
    weightG: data.weightG ? parseInt(data.weightG, 10) : null,
    productUrl: data.productUrl || null,
    rating: data.rating ? parseFloat(data.rating) : null,
    tastingNotes: data.tastingNotesRaw
      ? data.tastingNotesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null,
    review: data.review || null,
    purchasedAt: data.purchasedAt || null,
  }
}

export default function EditCoffeePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: coffee, isLoading } = useCoffee(id)
  const updateCoffee = useUpdateCoffee(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!coffee) {
    return <p className="text-sm text-destructive">Café no encontrado.</p>
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/coffees/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {coffee.name}
      </Link>
      <h1 className="font-heading text-2xl font-semibold leading-tight">Editar café</h1>
      <CoffeeForm
        defaultValues={coffee}
        submitLabel="Guardar cambios"
        onCancel={() => router.back()}
        onSubmit={async (data) => {
          try {
            await updateCoffee.mutateAsync(parseCoffeeForm(data))
            toast.success('Café actualizado')
            router.push(`/coffees/${id}`)
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al actualizar')
          }
        }}
      />
    </div>
  )
}
