import { Card } from '@/components/ui'

export default function ConsolePage() {
  return (
    <div>
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-primary mb-2">
          Overview
        </h1>
        <p className="text-text-muted mb-6">A snapshot of your programme at a glance.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lead metric — hero card */}
        <Card tone="hero" className="min-h-[120px] flex flex-col justify-between md:col-span-2 lg:col-span-1 animate-scale-in hover-lift">
          <div className="text-white/70 text-sm font-medium mb-2">Members</div>
          <div className="text-4xl font-display font-bold text-white">0</div>
        </Card>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px] hover-lift">
          <div className="text-text-muted text-sm font-medium mb-2">
            Submissions
          </div>
          <div className="text-3xl font-bold text-primary">0</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px] hover-lift">
          <div className="text-text-muted text-sm font-medium mb-2">
            Reports
          </div>
          <div className="text-3xl font-bold text-primary">0</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px] hover-lift">
          <div className="text-text-muted text-sm font-medium mb-2">
            Delivered
          </div>
          <div className="text-3xl font-bold text-secondary">0</div>
        </div>
      </div>
    </div>
  )
}
