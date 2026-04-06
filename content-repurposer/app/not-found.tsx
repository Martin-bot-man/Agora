// app/not-found.tsx
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-900">
      <div className="text-center p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h1 className="text-6xl font-semibold tracking-tight">404</h1>
        <p className="text-xl mt-4 text-slate-800">Page not found</p>
        <p className="mt-2 text-slate-500">Sorry, we couldn't find what you're looking for.</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white hover:bg-slate-800"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}
