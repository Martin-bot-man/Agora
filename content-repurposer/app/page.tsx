import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
          <div className="absolute top-40 right-10 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Resume Architect 2026
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                Your career.
                <br />
                Engineered for impact.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                A private career studio that turns raw experience into ATS-ready, modern resumes and a job
                search pipeline that actually moves.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white hover:bg-slate-800"
                >
                  Start free
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-md border border-slate-200 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-700 hover:text-slate-900"
                >
                  View dashboard
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "ATS score lift", value: "3.7x" },
                  { label: "Avg. time to apply", value: "12 min" },
                  { label: "Active roles tracked", value: "18k+" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Resume intelligence
                </div>
                <h2 className="mt-3 text-2xl font-semibold">
                  Your resume, upgraded in minutes.
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Upload your resume, paste the job description, and we tailor your content with the right
                  keywords and signal.
                </p>
                <div className="mt-6 grid gap-3">
                  {[
                    "Keyword injection for ATS",
                    "Executive summary rewrites",
                    "Impact metrics guidance",
                  ].map((item) => (
                    <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Job tracker</div>
                <h2 className="mt-3 text-2xl font-semibold">Every application, organized.</h2>
                <p className="mt-3 text-sm text-slate-600">
                  Track roles, manage outreach, and move roles across stages with clarity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Signal-first resumes",
              desc: "Optimized for recruiters and ATS filters.",
            },
            {
              title: "Job pipelines",
              desc: "A structured flow from lead to offer.",
            },
            {
              title: "Community jobs",
              desc: "Post roles and hire faster with zero friction.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
