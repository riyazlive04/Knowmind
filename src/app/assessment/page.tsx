export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-primary font-fraunces">
          KnowMind Assessment
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-primary mb-8 font-fraunces">
          Emotional Intelligence Assessment
        </h2>

        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-muted mb-6">
            Assessment content will be displayed here
          </p>
          <p className="text-sm text-text-muted">
            27 items across 6 domains + 3 free-text questions
          </p>
        </div>
      </main>
    </div>
  )
}
