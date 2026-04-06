export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">System Status</h1>
        <p className="text-base text-slate-600">
          All systems are operational. If you are experiencing issues, reach out to support.
        </p>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Operational
        </div>
      </div>
    </main>
  );
}
