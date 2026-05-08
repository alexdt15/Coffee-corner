'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { RoasterForm } from '@/components/roaster-form'
import { useCreateRoaster } from '@/lib/hooks'

export default function NewRoasterPage() {
  const router = useRouter()
  const createRoaster = useCreateRoaster()

  return (
    <div className="space-y-6">
      <Link href="/roasters" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Tostadores
      </Link>
      <h1 className="font-heading text-2xl font-semibold leading-tight">Nuevo tostador</h1>
      <RoasterForm
        submitLabel="Crear tostador"
        onCancel={() => router.back()}
        onSubmit={async (data) => {
          try {
            const roaster = await createRoaster.mutateAsync(data)
            toast.success('Tostador creado')
            router.push(`/roasters/${roaster.id}`)
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al crear el tostador')
          }
        }}
      />
    </div>
  )
}
