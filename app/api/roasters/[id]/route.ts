import { NextRequest } from 'next/server'
import { db } from '@/db'
import { roasters } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { SOLO_USER_ID } from '@/lib/constants'
import { roasterPatchSchema } from '@/lib/validation'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const [roaster] = await db
      .select()
      .from(roasters)
      .where(and(eq(roasters.id, id), eq(roasters.userId, SOLO_USER_ID)))
      .limit(1)

    if (!roaster) {
      return Response.json({ error: 'Tostador no encontrado' }, { status: 404 })
    }

    return Response.json(roaster)
  } catch {
    return Response.json({ error: 'Error al obtener tostador' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => null)
    const parsed = roasterPatchSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const d = parsed.data
    const [updated] = await db
      .update(roasters)
      .set({
        ...(d.name !== undefined && { name: d.name }),
        ...(d.websiteUrl !== undefined && { websiteUrl: d.websiteUrl || null }),
        ...(d.country !== undefined && { country: d.country || null }),
        ...(d.notes !== undefined && { notes: d.notes || null }),
        updatedAt: new Date(),
      })
      .where(and(eq(roasters.id, id), eq(roasters.userId, SOLO_USER_ID)))
      .returning()

    if (!updated) {
      return Response.json({ error: 'Tostador no encontrado' }, { status: 404 })
    }

    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Error al actualizar tostador' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const [deleted] = await db
      .delete(roasters)
      .where(and(eq(roasters.id, id), eq(roasters.userId, SOLO_USER_ID)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Tostador no encontrado' }, { status: 404 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Error al eliminar tostador' }, { status: 500 })
  }
}
