export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Security</h1>
        <p className="text-base text-slate-600">
          We use industry-standard encryption in transit and at rest. Access to your data is
          limited by strict least-privilege policies.
        </p>
        <p className="text-base text-slate-600">
          Report security concerns to security@resume-architect.ai.
        </p>
      </div>
    </main>
  );
}
