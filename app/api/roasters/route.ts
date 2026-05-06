import { NextRequest } from 'next/server'
import { db } from '@/db'
import { roasters, coffees } from '@/db/schema'
import { eq, count, avg } from 'drizzle-orm'
import { SOLO_USER_ID } from '@/lib/constants'
import { roasterInsertSchema } from '@/lib/validation'

export async function GET() {
  try {
    const rows = await db
      .select({
        id: roasters.id,
        name: roasters.name,
        country: roasters.country,
        websiteUrl: roasters.websiteUrl,
        notes: roasters.notes,
        createdAt: roasters.createdAt,
        updatedAt: roasters.updatedAt,
        coffeeCount: count(coffees.id),
        avgRating: avg(coffees.rating),
      })
      .from(roasters)
      .leftJoin(coffees, eq(coffees.roasterId, roasters.id))
      .where(eq(roasters.userId, SOLO_USER_ID))
      .groupBy(roasters.id)

    return Response.json(rows)
  } catch {
    return Response.json({ error: 'Error al obtener tostadores' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = roasterInsertSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, websiteUrl, country, notes } = parsed.data
    const [roaster] = await db
      .insert(roasters)
      .values({
        userId: SOLO_USER_ID,
        name,
        websiteUrl: websiteUrl || null,
        country: country || null,
        notes: notes || null,
      })
      .returning()

    return Response.json(roaster, { status: 201 })
  } catch {
    return Response.json({ error: 'Error al crear tostador' }, { status: 500 })
  }
}
