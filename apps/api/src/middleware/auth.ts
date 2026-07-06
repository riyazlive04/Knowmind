import { Request, Response, NextFunction } from 'express'

/**
 * Server-to-server auth for delivery routes.
 *
 * Browsers never hit the Express backend directly — they go through the Next.js
 * API routes, which are already gated by the Auth.js session middleware. This
 * guard secures that Next.js → Express hop with a shared bearer token
 * (BACKEND_API_TOKEN).
 *
 * Fail-open when no token is configured (logs a warning) so local/dev setups
 * keep working; once BACKEND_API_TOKEN is set on both apps, it is enforced.
 */
export function requireServiceToken(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.BACKEND_API_TOKEN

  if (!expected) {
    console.warn('[auth] BACKEND_API_TOKEN not set — delivery routes are UNAUTHENTICATED')
    return next()
  }

  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : header

  if (token !== expected) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
