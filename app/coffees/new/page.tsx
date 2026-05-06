'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { CoffeeForm, type CoffeeFormValues } from '@/components/coffee-form'
import { useCreateCoffee } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'

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
      ? data.tastingNotesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null,
    review: data.review || null,
    purchasedAt: data.purchasedAt || null,
  }
}

function NewCoffeeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roasterId = searchParams.get('roasterId') ?? ''
  const createCoffee = useCreateCoffee()

  if (!roasterId) {
    return <p className="text-sm text-destructive">Falta el ID del tostador.</p>
  }

  return (
    <CoffeeForm
      submitLabel="Crear café"
      onCancel={() => router.back()}
      onSubmit={async (data) => {
        try {
          const coffee = await createCoffee.mutateAsync(parseCoffeeForm(data, roasterId))
          toast.success('Café añadido')
          router.push(`/coffees/${coffee.id}`)
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Error al crear el café')
        }
      }}
    />
  )
}

export default function NewCoffeePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Tostadores
      </Link>
      <h1 className="text-xl font-semibold">Nuevo café</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <NewCoffeeForm />
      </Suspense>
    </div>
  )
}
