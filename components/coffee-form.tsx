'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { urlOrEmpty } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  origin: z.string().optional(),
  variety: z.string().optional(),
  process: z.string().optional(),
  priceEur: z.string().refine((v) => !v || !isNaN(parseFloat(v)), 'Precio inválido').optional(),
  weightG: z.string().refine((v) => !v || !isNaN(parseInt(v)), 'Peso inválido').optional(),
  productUrl: urlOrEmpty.optional(),
  rating: z
    .string()
    .refine((v) => !v || (parseFloat(v) >= 0 && parseFloat(v) <= 5), 'Entre 0 y 5')
    .optional(),
  tastingNotesRaw: z.string().optional(),
  review: z.string().optional(),
  purchasedAt: z
    .string()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Fecha inválida')
    .optional(),
})

export type CoffeeFormValues = z.infer<typeof schema>

export interface CoffeeFormDefaults {
  name?: string | null
  origin?: string | null
  variety?: string | null
  process?: string | null
  priceCents?: number | null
  weightG?: number | null
  productUrl?: string | null
  rating?: number | null
  tastingNotes?: string[] | null
  review?: string | null
  purchasedAt?: string | null
}

interface Props {
  defaultValues?: CoffeeFormDefaults
  onSubmit: (data: CoffeeFormValues) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

export function CoffeeForm({ defaultValues, onSubmit, submitLabel = 'Guardar', onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CoffeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      origin: defaultValues?.origin ?? '',
      variety: defaultValues?.variety ?? '',
      process: defaultValues?.process ?? '',
      priceEur:
        defaultValues?.priceCents != null
          ? (defaultValues.priceCents / 100).toFixed(2)
          : '',
      weightG: defaultValues?.weightG != null ? String(defaultValues.weightG) : '',
      productUrl: defaultValues?.productUrl ?? '',
      rating: defaultValues?.rating != null ? String(defaultValues.rating) : '',
      tastingNotesRaw: defaultValues?.tastingNotes?.join(', ') ?? '',
      review: defaultValues?.review ?? '',
      purchasedAt: defaultValues?.purchasedAt ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register('name')} placeholder="Ethiopia Yirgacheffe" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="origin">Origen</Label>
          <Input id="origin" {...register('origin')} placeholder="Etiopía" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="variety">Variedad</Label>
          <Input id="variety" {...register('variety')} placeholder="Heirloom" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="process">Proceso</Label>
        <Input id="process" {...register('process')} placeholder="Natural, Washed, Honey…" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="priceEur">Precio (€)</Label>
          <Input id="priceEur" {...register('priceEur')} placeholder="14.99" inputMode="decimal" />
          {errors.priceEur && (
            <p className="text-xs text-destructive">{errors.priceEur.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weightG">Peso (g)</Label>
          <Input id="weightG" {...register('weightG')} placeholder="250" inputMode="numeric" />
          {errors.weightG && (
            <p className="text-xs text-destructive">{errors.weightG.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rating">Puntuación (0–5)</Label>
        <Input id="rating" {...register('rating')} placeholder="4.2" inputMode="decimal" />
        {errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tastingNotesRaw">Notas de cata</Label>
        <Input
          id="tastingNotesRaw"
          {...register('tastingNotesRaw')}
          placeholder="Chocolate, frutos rojos, caramelo"
        />
        <p className="text-xs text-muted-foreground">Separadas por comas</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="productUrl">URL del producto</Label>
        <Input
          id="productUrl"
          {...register('productUrl')}
          placeholder="https://tienda.com/cafe"
        />
        {errors.productUrl && (
          <p className="text-xs text-destructive">{errors.productUrl.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="purchasedAt">Fecha de compra</Label>
        <Input id="purchasedAt" type="date" {...register('purchasedAt')} />
        {errors.purchasedAt && (
          <p className="text-xs text-destructive">{errors.purchasedAt.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review">Reseña</Label>
        <Textarea
          id="review"
          {...register('review')}
          placeholder="Mis impresiones sobre este café…"
          rows={4}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
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
