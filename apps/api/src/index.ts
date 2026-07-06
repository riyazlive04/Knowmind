import app from './app'

// Local dev / standalone server. On Vercel the app is served as a serverless
// function via api/index.ts instead.
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`KnowMind backend running on http://localhost:${PORT}`)
})
