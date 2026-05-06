import { z } from 'zod'

export const urlOrEmpty = z
  .string()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), 'URL inválida')

export const roasterInsertSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  websiteUrl: urlOrEmpty.optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const roasterPatchSchema = roasterInsertSchema.partial()

export const coffeeInsertSchema = z.object({
  roasterId: z.string().uuid('ID de tostador inválido'),
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  origin: z.string().max(200).optional().nullable(),
  variety: z.string().max(200).optional().nullable(),
  process: z.string().max(100).optional().nullable(),
  priceCents: z.number().int().nonnegative('El precio debe ser positivo').optional().nullable(),
  weightG: z.number().int().nonnegative('El peso debe ser positivo').optional().nullable(),
  productUrl: urlOrEmpty.optional().nullable(),
  rating: z.number().min(0, 'Mínimo 0').max(5, 'Máximo 5').optional().nullable(),
  tastingNotes: z.array(z.string().max(100)).optional().nullable(),
  review: z.string().optional().nullable(),
  purchasedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)')
    .optional()
    .nullable(),
})

export const coffeePatchSchema = coffeeInsertSchema.partial()

export type RoasterInsert = z.infer<typeof roasterInsertSchema>
export type RoasterPatch = z.infer<typeof roasterPatchSchema>
export type CoffeeInsert = z.infer<typeof coffeeInsertSchema>
export type CoffeePatch = z.infer<typeof coffeePatchSchema>
