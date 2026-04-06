export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="text-base text-slate-600">
          Have a question or want to share feedback? We respond within 2 business days.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Email: support@resume-architect.ai
        </div>
      </div>
    </main>
  );
}
