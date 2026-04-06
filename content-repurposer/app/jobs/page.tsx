"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import jobsBg from "@/assets/photocollege2.png";

type JobPost = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  jobType?: string | null;
  applyUrl?: string | null;
  applyEmail?: string | null;
  description: string;
  createdAt: string;
};

const emptyForm = {
  title: "",
  company: "",
  location: "",
  jobType: "",
  applyUrl: "",
  applyEmail: "",
  description: "",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load jobs.");
      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (!query) return jobs;
    const q = query.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.location || "").toLowerCase().includes(q)
    );
  }, [jobs, query]);

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to post job.");
      setSuccess("Job posted! It’s now live in the community feed.");
      setForm(emptyForm);
      await fetchJobs();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${jobsBg.src})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white/70 p-6 backdrop-blur-md md:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Community Jobs
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Post your role.
              <br />
              Hire the next standout.
            </h1>
            <p className="max-w-xl text-base text-slate-600">
              A public board where hiring teams and founders can post roles in minutes. No approvals. No
              gatekeeping.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/auth/signup"
                className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-800"
              >
                Create account
              </Link>
              <button
                onClick={() => document.getElementById("post-job-form")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-md border border-slate-200 bg-white px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-900"
              >
                Post a job
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Why teams post here</div>
            <div className="mt-6 grid gap-4 text-sm text-slate-600">
              {[
                "Reach builders, designers, and operators who move fast.",
                "Zero friction: publish immediately.",
                "Clean, focused job cards that convert.",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Live roles</div>
                <h2 className="mt-2 text-2xl font-semibold">Community feed</h2>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {jobs.length} jobs
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <label htmlFor="community-search" className="text-sm font-semibold text-slate-700">
                Search roles
              </label>
              <input
                id="community-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                aria-describedby="community-search-help"
              />
              <p id="community-search-help" className="text-sm text-slate-500">
                Try role title, company name, or location.
              </p>
            </div>

            {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}
            {loading && <div className="mt-4 text-sm text-slate-600">Loading jobs...</div>}

            <div className="mt-6 space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                      {job.jobType && (
                        <span className="rounded-full border border-slate-200 px-3 py-1">{job.jobType}</span>
                      )}
                      {job.location && (
                        <span className="rounded-full border border-slate-200 px-3 py-1">{job.location}</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-slate-900 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-white"
                      >
                        Apply link
                      </a>
                    )}
                    {job.applyEmail && (
                      <span className="rounded-md border border-slate-200 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {job.applyEmail}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {!loading && filteredJobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                  No jobs yet. Be the first to post.
                </div>
              )}
            </div>
          </section>

          <section id="post-job-form" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Post a job</div>
            <h2 className="mt-2 text-2xl font-semibold">Publish instantly</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill out the role details and we will publish it immediately.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="post-title" className="text-sm font-semibold text-slate-700">
                    Role title
                  </label>
                  <input
                    id="post-title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Role title"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-title-help"
                    required
                  />
                  <p id="post-title-help" className="text-sm text-slate-500">
                    Use the exact title from your listing.
                  </p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="post-company" className="text-sm font-semibold text-slate-700">
                    Company name
                  </label>
                  <input
                    id="post-company"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    placeholder="Company name"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-company-help"
                    required
                  />
                  <p id="post-company-help" className="text-sm text-slate-500">
                    The hiring company or agency name.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="post-location" className="text-sm font-semibold text-slate-700">
                    Location
                  </label>
                  <input
                    id="post-location"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Location (e.g., Remote, London, NYC)"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-location-help"
                  />
                  <p id="post-location-help" className="text-sm text-slate-500">
                    City, country, or “Remote”.
                  </p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="post-jobtype" className="text-sm font-semibold text-slate-700">
                    Job type
                  </label>
                  <input
                    id="post-jobtype"
                    value={form.jobType}
                    onChange={(e) => handleChange("jobType", e.target.value)}
                    placeholder="Job type (Full-time, Contract, etc.)"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-jobtype-help"
                  />
                  <p id="post-jobtype-help" className="text-sm text-slate-500">
                    Helps candidates quickly filter.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="post-apply-url" className="text-sm font-semibold text-slate-700">
                    Apply link
                  </label>
                  <input
                    id="post-apply-url"
                    value={form.applyUrl}
                    onChange={(e) => handleChange("applyUrl", e.target.value)}
                    placeholder="Apply link (optional)"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-apply-url-help"
                  />
                  <p id="post-apply-url-help" className="text-sm text-slate-500">
                    Use a full URL, e.g., https://…
                  </p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="post-apply-email" className="text-sm font-semibold text-slate-700">
                    Apply email
                  </label>
                  <input
                    id="post-apply-email"
                    value={form.applyEmail}
                    onChange={(e) => handleChange("applyEmail", e.target.value)}
                    placeholder="Apply email (optional)"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    aria-describedby="post-apply-email-help"
                  />
                  <p id="post-apply-email-help" className="text-sm text-slate-500">
                    Optional, if you accept email applications.
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="post-description" className="text-sm font-semibold text-slate-700">
                  Role description
                </label>
                <textarea
                  id="post-description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe the role, responsibilities, and what success looks like..."
                  rows={6}
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  aria-describedby="post-description-help"
                  required
                />
                <p id="post-description-help" className="text-sm text-slate-500">
                  Include responsibilities, requirements, and benefits.
                </p>
              </div>

              {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
              {error && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{error}</div>}

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitLoading ? "Publishing..." : "Publish job"}
              </button>
            </form>
          </section>
          </div>
        </div>
      </div>
    </main>
  );
}
