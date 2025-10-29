import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const SESSION_COOKIE_NAME = 'vh_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 // 1 hour
export const ROTATE_THRESHOLD_SECONDS = 15 * 60 // rotate when < 15 minutes remain

type SessionPayload = JWTPayload & {
  sub: string
  email: string
  role: 'User' | 'Admin' | 'Staff' | 'SuperAdmin' | 'master_admin'
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || ''
  if (!secret || secret.length < 32) {
    // Intentionally avoid logging value; guide developers via error message.
    throw new Error('JWT_SECRET must be set and at least 32 characters long')
  }
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(payload: SessionPayload, expiresInSeconds = SESSION_MAX_AGE_SECONDS): Promise<string> {
  const secret = getJwtSecret()
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresInSeconds}s`)
    .setSubject(payload.sub)
    .setIssuer('voyagehub')
    .sign(secret)
  return jwt
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getJwtSecret()
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'voyagehub',
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch {
    return null
  }
}

export function buildCookieOptions(token: string) {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: isProd, // In dev on http://localhost, secure cookies won’t be set.
      sameSite: 'strict' as const,
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  }
}

export function canAccessAdmin(role: SessionPayload['role']): boolean {
  return role === 'master_admin' || role === 'Admin' || role === 'Staff' || role === 'SuperAdmin'
}

