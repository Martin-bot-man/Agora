"use client";

import { useEffect, useState } from "react";

type JobPost = {
  id: string;
  title: string;
  location?: string | null;
  jobType?: string | null;
  description: string;
  applyUrl?: string | null;
  applyEmail?: string | null;
};

type Company = {
  name: string;
  website?: string | null;
  description?: string | null;
  jobPosts: JobPost[];
};

type Params = {
  params: { slug: string };
};

export default function CompanyProfilePage({ params }: Params) {
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/companies/${params.slug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Unable to load company.");
        setCompany(data.company);
      } catch (err: any) {
        setError(err.message);
      }
    };
    load();
  }, [params.slug]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {!company && !error && <p className="text-sm text-slate-600">Loading...</p>}
        {company && (
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Company</div>
              <h1 className="mt-3 text-3xl font-semibold">{company.name}</h1>
              {company.website && (
                <a className="mt-2 block text-sm text-slate-600 hover:text-slate-900" href={company.website}>
                  {company.website}
                </a>
              )}
              {company.description && <p className="mt-3 text-sm text-slate-600">{company.description}</p>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Open roles</div>
              <div className="mt-4 space-y-4">
                {company.jobPosts.length === 0 && (
                  <p className="text-sm text-slate-600">No open roles yet.</p>
                )}
                {company.jobPosts.map((job) => (
                  <div key={job.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-semibold">{job.title}</h2>
                        <p className="text-sm text-slate-500">
                          {[job.location, job.jobType].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {(job.applyUrl || job.applyEmail) && (
                        <div className="text-sm text-slate-600">
                          {job.applyUrl ? (
                            <a className="font-semibold text-slate-900" href={job.applyUrl}>
                              Apply →
                            </a>
                          ) : (
                            <a className="font-semibold text-slate-900" href={`mailto:${job.applyEmail}`}>
                              Apply →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
