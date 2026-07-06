import { createApp } from './app'

// Local dev / standalone server. On Vercel the app is served by api/index.ts
// (serverless) instead, which imports createApp() without listening.
const app = createApp()
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`KnowMind backend running on http://localhost:${PORT}`)
})
