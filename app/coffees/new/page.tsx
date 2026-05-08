'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { CoffeeForm, type CoffeeFormValues } from '@/components/coffee-form'
import { useCreateCoffee, useRoasters } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'

function parseCoffeeForm(data: CoffeeFormValues, roasterId: string) {
  return {
    roasterId,
    name: data.name,
    origin: data.origin || null,
    variety: data.variety || null,
    process: data.process || null,
    priceCents: data.priceEur ? Math.round(parseFloat(data.priceEur) * 100) : null,
    weightG: data.weightG ? parseInt(data.weightG, 10) : null,
    productUrl: data.productUrl || null,
    rating: data.rating ? parseFloat(data.rating) : null,
    tastingNotes: data.tastingNotesRaw
      ? data.tastingNotesRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : null,
    review: data.review || null,
    purchasedAt: data.purchasedAt || null,
  }
}

function NewCoffeeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlRoasterId = searchParams.get('roasterId') ?? ''
  const createCoffee = useCreateCoffee()

  const { data: roasters, isLoading: loadingRoasters } = useRoasters()
  const [selectedRoasterId, setSelectedRoasterId] = useState(urlRoasterId)
  const [roasterError, setRoasterError] = useState(false)

  // Auto-select when there is exactly one roaster
  useEffect(() => {
    if (!urlRoasterId && roasters?.length === 1) {
      setSelectedRoasterId(roasters[0].id)
    }
  }, [urlRoasterId, roasters])

  if (loadingRoasters) {
    return <Skeleton className="h-10 w-full rounded-xl" />
  }

  if (!roasters || roasters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Primero necesitas{' '}
        <Link href="/roasters/new" className="text-primary underline">
          crear un tostador
        </Link>
        .
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {!urlRoasterId && (
        <div className="space-y-1.5">
          <Label htmlFor="roaster-select">Tostador</Label>
          <select
            id="roaster-select"
            value={selectedRoasterId}
            onChange={(e) => {
              setSelectedRoasterId(e.target.value)
              setRoasterError(false)
            }}
            className="h-10 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/25"
          >
            <option value="" disabled>Selecciona un tostador…</option>
            {roasters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}{r.country ? ` — ${r.country}` : ''}
              </option>
            ))}
          </select>
          {roasterError && (
            <p className="text-xs text-destructive">Selecciona un tostador para continuar.</p>
          )}
        </div>
      )}

      <CoffeeForm
        submitLabel="Crear café"
        onCancel={() => router.back()}
        onSubmit={async (data) => {
          if (!selectedRoasterId) {
            setRoasterError(true)
            return
          }
          try {
            const coffee = await createCoffee.mutateAsync(parseCoffeeForm(data, selectedRoasterId))
            toast.success('Café añadido')
            router.push(`/coffees/${coffee.id}`)
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al crear el café')
          }
        }}
      />
    </div>
  )
}

export default function NewCoffeePage() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Volver
      </button>
      <h1 className="font-heading text-2xl font-semibold leading-tight">Nuevo café</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <NewCoffeeForm />
      </Suspense>
    </div>
  )
}
