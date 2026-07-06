// Vercel serverless entrypoint for the Express API.
// An Express app is itself an (req, res) handler, so exporting it as default
// lets @vercel/node serve every route. The vercel.json rewrite funnels all
// paths here so Express's own routing (/api/health, /api/reports, ...) applies.
import { createApp } from '../src/app'

export default createApp()
