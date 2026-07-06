// Vercel serverless entrypoint for the Express API.
//
// Wrapped with diagnostics: any initialization failure (e.g. DB client setup)
// is returned in the HTTP response instead of an opaque FUNCTION_INVOCATION_FAILED,
// so the real cause is visible in the browser. Remove the diagnostics once the
// deployment is healthy.
import type { IncomingMessage, ServerResponse } from 'http'

let handler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null
let initError: unknown = null

try {
  // Lazy require so a throw during module init is caught here (a top-level
  // import would throw before this try/catch could run).
  const { createApp } = require('../src/app')
  handler = createApp()
} catch (e) {
  initError = e
}

export default function (req: IncomingMessage, res: ServerResponse) {
  if (initError || !handler) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(
      JSON.stringify(
        {
          error: 'API initialization failed',
          message: (initError as any)?.message ?? String(initError),
          stack: (initError as any)?.stack ?? null,
          env: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasDirectUrl: !!process.env.DIRECT_URL,
            nodeVersion: process.version,
          },
        },
        null,
        2
      )
    )
    return
  }

  try {
    return handler(req, res)
  } catch (e: any) {
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'request handler threw', message: e?.message, stack: e?.stack }, null, 2))
  }
}
