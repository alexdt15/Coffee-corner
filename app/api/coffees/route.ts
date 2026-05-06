import { NextRequest } from 'next/server'
import { db } from '@/db'
import { coffees, roasters } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { SOLO_USER_ID } from '@/lib/constants'
import { coffeeInsertSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const roasterId = searchParams.get('roasterId')

    const rows = await db
      .select({
        id: coffees.id,
        name: coffees.name,
        roasterId: coffees.roasterId,
        origin: coffees.origin,
        variety: coffees.variety,
        process: coffees.process,
        priceCents: coffees.priceCents,
        weightG: coffees.weightG,
        productUrl: coffees.productUrl,
        rating: coffees.rating,
        tastingNotes: coffees.tastingNotes,
        purchasedAt: coffees.purchasedAt,
        createdAt: coffees.createdAt,
        roasterName: roasters.name,
      })
      .from(coffees)
      .leftJoin(roasters, eq(coffees.roasterId, roasters.id))
      .where(
        roasterId
          ? and(eq(coffees.userId, SOLO_USER_ID), eq(coffees.roasterId, roasterId))
          : eq(coffees.userId, SOLO_USER_ID),
      )
      .orderBy(desc(coffees.createdAt))

    return Response.json(rows)
  } catch {
    return Response.json({ error: 'Error al obtener cafés' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = coffeeInsertSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    const [coffee] = await db
      .insert(coffees)
      .values({
        userId: SOLO_USER_ID,
        roasterId: d.roasterId,
        name: d.name,
        origin: d.origin || null,
        variety: d.variety || null,
        process: d.process || null,
        priceCents: d.priceCents ?? null,
        weightG: d.weightG ?? null,
        productUrl: d.productUrl || null,
        rating: d.rating ?? null,
        tastingNotes: d.tastingNotes ?? null,
        review: d.review || null,
        purchasedAt: d.purchasedAt || null,
      })
      .returning()

    return Response.json(coffee, { status: 201 })
  } catch {
    return Response.json({ error: 'Error al crear café' }, { status: 500 })
  }
}
