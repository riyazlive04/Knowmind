export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6 font-fraunces">
        Settings
      </h1>
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Branding</h2>
            <p className="text-text-muted">Brand settings to be configured</p>
          </div>
          <div className="border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Preferences
            </h2>
            <p className="text-text-muted">User preferences to be configured</p>
          </div>
        </div>
      </div>
    </div>
  )
}
