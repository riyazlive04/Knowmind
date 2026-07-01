'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary font-fraunces">KnowMind</h1>
          <nav className="flex gap-6">
            <Link href="/assessment" className="text-text hover:text-primary transition">
              Assessment
            </Link>
            <Link href="/" className="text-text hover:text-primary transition">
              Back
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-primary font-fraunces leading-tight">
                Understand Your Emotional Intelligence
              </h2>
              <p className="text-xl text-text-muted leading-relaxed">
                Emotional intelligence is the foundation of effective leadership, stronger relationships,
                and personal success. Discover your EI profile across 6 key domains.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-primary font-fraunces">What You&apos;ll Learn</h3>
              <ul className="space-y-3">
                {[
                  'Self-Awareness: How well you understand your emotions',
                  'Self-Regulation: Your ability to manage emotions effectively',
                  'Motivation: Your drive and resilience toward goals',
                  'Empathy: Your ability to understand others&apos; emotions',
                  'Social & Leadership Skills: Your interpersonal effectiveness',
                  'Relationship Intelligence: Your ability to build strong connections',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-secondary text-2xl">✓</span>
                    <span className="text-text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/assessment"
                className="inline-block px-8 py-4 bg-primary text-primary-fg font-semibold rounded-lg hover:bg-primary-hover transition-colors text-lg"
              >
                Start Assessment →
              </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-80 h-80">
              {/* Hexagon illustration */}
              <svg viewBox="0 0 300 300" className="w-full h-full">
                {/* Background circles */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <circle
                    key={`circle-${i}`}
                    cx="150"
                    cy="150"
                    r={i * 30}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border opacity-30"
                  />
                ))}

                {/* Hexagon */}
                <polygon
                  points="150,50 239.1,112.5 239.1,237.5 150,300 60.9,237.5 60.9,112.5"
                  fill="rgb(139, 92, 246)"
                  fillOpacity="0.2"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth="2"
                />

                {/* Center dot */}
                <circle cx="150" cy="150" r="8" fill="rgb(139, 92, 246)" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center font-fraunces">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Take the Assessment',
                desc: 'Answer 27 carefully designed questions about how you think, feel, and act.',
              },
              {
                step: '2',
                title: 'Get Your Profile',
                desc: 'Receive a detailed analysis of your emotional intelligence across 6 domains.',
              },
              {
                step: '3',
                title: 'Plan for Growth',
                desc: 'Identify your strengths and growth edges to develop your emotional intelligence.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-fg text-2xl font-bold font-fraunces">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-primary">{item.title}</h3>
                <p className="text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8">
        <h2 className="text-4xl font-bold text-primary font-fraunces">
          Ready to Understand Yourself Better?
        </h2>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          The assessment takes about 10 minutes. Your responses help you create a personalized
          emotional intelligence profile to guide your development.
        </p>
        <Link
          href="/assessment"
          className="inline-block px-10 py-4 bg-secondary text-secondary-fg font-semibold rounded-lg hover:bg-secondary-hover transition-colors text-lg"
        >
          Start Your Assessment
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted">
          <p>© 2026 KnowMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
