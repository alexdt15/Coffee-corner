'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { RoasterForm } from '@/components/roaster-form'
import { useRoaster, useUpdateRoaster } from '@/lib/hooks'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditRoasterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: roaster, isLoading } = useRoaster(id)
  const updateRoaster = useUpdateRoaster(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
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
      <Link
        href={`/roasters/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {roaster.name}
      </Link>
      <h1 className="font-heading text-2xl font-semibold leading-tight">Editar tostador</h1>
      <RoasterForm
        defaultValues={{
          name: roaster.name,
          websiteUrl: roaster.websiteUrl ?? '',
          country: roaster.country ?? '',
          notes: roaster.notes ?? '',
        }}
        submitLabel="Guardar cambios"
        onCancel={() => router.back()}
        onSubmit={async (data) => {
          try {
            await updateRoaster.mutateAsync(data)
            toast.success('Tostador actualizado')
            router.push(`/roasters/${id}`)
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al actualizar')
          }
        }}
      />
    </div>
  )
}
