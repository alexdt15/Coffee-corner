import { NextRequest } from 'next/server'
import { db } from '@/db'
import { coffees, roasters } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { SOLO_USER_ID } from '@/lib/constants'
import { coffeePatchSchema } from '@/lib/validation'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const [row] = await db
      .select({
        id: coffees.id,
        userId: coffees.userId,
        roasterId: coffees.roasterId,
        name: coffees.name,
        origin: coffees.origin,
        variety: coffees.variety,
        process: coffees.process,
        priceCents: coffees.priceCents,
        weightG: coffees.weightG,
        productUrl: coffees.productUrl,
        rating: coffees.rating,
        tastingNotes: coffees.tastingNotes,
        review: coffees.review,
        purchasedAt: coffees.purchasedAt,
        createdAt: coffees.createdAt,
        updatedAt: coffees.updatedAt,
        roasterName: roasters.name,
      })
      .from(coffees)
      .leftJoin(roasters, eq(coffees.roasterId, roasters.id))
      .where(and(eq(coffees.id, id), eq(coffees.userId, SOLO_USER_ID)))
      .limit(1)

    if (!row) {
      return Response.json({ error: 'Café no encontrado' }, { status: 404 })
    }

    return Response.json(row)
  } catch {
    return Response.json({ error: 'Error al obtener café' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => null)
    const parsed = coffeePatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    const [updated] = await db
      .update(coffees)
      .set({
        ...(d.name !== undefined && { name: d.name }),
        ...(d.roasterId !== undefined && { roasterId: d.roasterId }),
        ...(d.origin !== undefined && { origin: d.origin || null }),
        ...(d.variety !== undefined && { variety: d.variety || null }),
        ...(d.process !== undefined && { process: d.process || null }),
        ...(d.priceCents !== undefined && { priceCents: d.priceCents ?? null }),
        ...(d.weightG !== undefined && { weightG: d.weightG ?? null }),
        ...(d.productUrl !== undefined && { productUrl: d.productUrl || null }),
        ...(d.rating !== undefined && { rating: d.rating ?? null }),
        ...(d.tastingNotes !== undefined && { tastingNotes: d.tastingNotes ?? null }),
        ...(d.review !== undefined && { review: d.review || null }),
        ...(d.purchasedAt !== undefined && { purchasedAt: d.purchasedAt || null }),
        updatedAt: new Date(),
      })
      .where(and(eq(coffees.id, id), eq(coffees.userId, SOLO_USER_ID)))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Café no encontrado' }, { status: 404 })
    }

    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Error al actualizar café' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const [deleted] = await db
      .delete(coffees)
      .where(and(eq(coffees.id, id), eq(coffees.userId, SOLO_USER_ID)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Café no encontrado' }, { status: 404 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Error al eliminar café' }, { status: 500 })
  }
}
