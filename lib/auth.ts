export const AUTH_COOKIE = 'cc_auth'
const TOKEN_PAYLOAD = 'authenticated:v1'

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export async function generateAuthToken(): Promise<string> {
  const secret = process.env.COOKIE_SECRET
  if (!secret) throw new Error('COOKIE_SECRET is not set')
  return hmac(secret, TOKEN_PAYLOAD)
}

export async function verifyAuthToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = process.env.COOKIE_SECRET
  if (!secret) return false
  const expected = await hmac(secret, TOKEN_PAYLOAD)
  return timingSafeEqual(token, expected)
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
