export default function ConsolePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6 font-fraunces">
        Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px]">
          <div className="text-text-muted text-sm font-medium mb-2">Members</div>
          <div className="text-3xl font-bold text-primary">0</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px]">
          <div className="text-text-muted text-sm font-medium mb-2">
            Submissions
          </div>
          <div className="text-3xl font-bold text-primary">0</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px]">
          <div className="text-text-muted text-sm font-medium mb-2">
            Reports
          </div>
          <div className="text-3xl font-bold text-primary">0</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 min-h-[120px]">
          <div className="text-text-muted text-sm font-medium mb-2">
            Delivered
          </div>
          <div className="text-3xl font-bold text-secondary">0</div>
        </div>
      </div>
    </div>
  )
}
