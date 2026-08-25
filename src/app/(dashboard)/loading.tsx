export default function Loading() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-60 shrink-0 border-r bg-sidebar hidden lg:flex flex-col">
        <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary animate-pulse">
            <div className="h-4 w-4 rounded-sm bg-primary-foreground/20" />
          </div>
          <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex-1 space-y-1.5 p-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-md bg-muted animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className="h-9 rounded-md bg-muted animate-pulse" />
          <div className="flex items-center gap-3 px-2">
            <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-24 rounded-md bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-14 lg:pb-0">
        <div className="flex flex-col min-h-full">
          <div className="flex-1 p-4 lg:p-6 xl:p-8 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-muted animate-pulse" />
                <div className="h-7 w-32 rounded-md bg-muted animate-pulse" />
              </div>
              <div className="h-10 w-40 rounded-md bg-muted animate-pulse" />
            </div>

            <div className="h-28 rounded-lg border border-primary/10 bg-gradient-to-r from-primary/5 to-amber-500/5 animate-pulse" />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-muted animate-pulse"
                  style={{ animationDelay: `${i * 75}ms` }}
                />
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 h-72 rounded-lg border bg-card animate-pulse" />
              <div className="h-72 rounded-lg border bg-card animate-pulse" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-64 rounded-lg border bg-card animate-pulse" />
              <div className="h-64 rounded-lg border bg-card animate-pulse" />
            </div>

            <div className="h-40 rounded-lg border bg-card animate-pulse" />
          </div>
          <footer className="border-t px-4 py-4 text-xs text-muted-foreground">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div className="h-3 w-32 rounded-md bg-muted/60 animate-pulse" />
              <div className="h-3 w-40 rounded-md bg-muted/60 animate-pulse" />
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
