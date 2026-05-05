import { NextResponse } from 'next/server'
import { AUTH_COOKIE, generateAuthToken, timingSafeEqual } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const password = typeof body?.password === 'string' ? body.password : ''
  const expected = process.env.APP_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }
  if (!timingSafeEqual(password, expected)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await generateAuthToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
