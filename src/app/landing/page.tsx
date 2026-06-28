export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-primary font-fraunces">
          KnowMind
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <section className="text-center mb-12">
          <h2 className="text-5xl font-bold text-primary mb-4 font-fraunces">
            See Yourself More Clearly
          </h2>
          <p className="text-lg text-text-muted mb-8">
            Discover your emotional intelligence and unlock your potential
          </p>
          <a
            href="/assessment"
            className="inline-block px-8 py-3 bg-primary text-primary-fg font-medium rounded-lg hover:bg-primary-hover transition-colors"
          >
            Start Assessment
          </a>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-lg p-8">
            <h3 className="text-2xl font-bold text-primary mb-4 font-fraunces">
              What is Emotional Intelligence?
            </h3>
            <p className="text-text-muted">
              Emotional intelligence (EI) is the ability to recognize, understand,
              and manage emotions in ourselves and others. It's a key predictor of
              success in business and relationships.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-8">
            <h3 className="text-2xl font-bold text-primary mb-4 font-fraunces">
              About This Assessment
            </h3>
            <p className="text-text-muted">
              Our 27-item assessment measures six dimensions of emotional
              intelligence including self-awareness, self-regulation, motivation,
              empathy, social skills, and relationship intelligence.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
