'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { urlOrEmpty } from '@/lib/validation'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  websiteUrl: urlOrEmpty.optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<FormValues>
  onSubmit: (data: FormValues) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

export function RoasterForm({ defaultValues, onSubmit, submitLabel = 'Guardar', onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      websiteUrl: '',
      country: '',
      notes: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register('name')} placeholder="Onyx Coffee Lab" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="country">País</Label>
        <Input id="country" {...register('country')} placeholder="Estados Unidos" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="websiteUrl">Web</Label>
        <Input id="websiteUrl" {...register('websiteUrl')} placeholder="https://onyxcoffeelab.com" />
        {errors.websiteUrl && (
          <p className="text-xs text-destructive">{errors.websiteUrl.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" {...register('notes')} placeholder="Tostador de especialidad en Arkansas..." rows={3} />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
