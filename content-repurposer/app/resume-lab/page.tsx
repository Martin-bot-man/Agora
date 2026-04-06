"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AtsResult = {
  score: number;
  status: string;
  missing: string[];
  matched: string[];
};

type ResumeVariant = {
  id: string;
  content: string;
  jobTitle?: string | null;
  company?: string | null;
  atsScore?: number | null;
  createdAt: string;
};

type ResumeProfile = {
  id: string;
  title: string;
  baseText: string;
  variants: ResumeVariant[];
};

export default function ResumeLabPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [output, setOutput] = useState("");
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profiles, setProfiles] = useState<ResumeProfile[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const variants = useMemo(
    () => profiles.flatMap((profile) => profile.variants.map((variant) => ({ ...variant, profile }))),
    [profiles]
  );

  const loadVariants = async () => {
    try {
      const res = await fetch("/api/resume-variants");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load variants.");
      setProfiles(Array.isArray(data?.profiles) ? data.profiles : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadVariants();
  }, []);

  const handleScore = async () => {
    setLoadingScore(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to score resume.");
      setAtsResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingScore(false);
    }
  };

  const handleGenerate = async () => {
    setLoadingGenerate(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, step: "ats_optimize" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to generate variant.");
      setOutput(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSaveVariant = async () => {
    if (!output.trim()) {
      setError("Generate a variant before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/resume-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeTitle: "Primary Resume",
          resumeText,
          jobTitle,
          company,
          jobDescription,
          content: output,
          atsScore: atsResult?.score,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to save variant.");
      setSuccess("Variant saved.");
      await loadVariants();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/resume-variants/${variantId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to delete variant.");
      setSuccess("Variant removed.");
      await loadVariants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.15)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Resume Lab</div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">ATS scoring + tailored variants</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Analyze keyword coverage, generate an optimized variant, and save the version you want to ship.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Score</div>
              <div className="text-2xl font-semibold text-slate-900">{atsResult?.score ?? "--"}%</div>
              <div className="text-xs text-slate-500">{atsResult?.status ?? "Add JD to score"}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-5">
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Job title
                    <input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Senior Product Designer"
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Company
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Stellar Labs"
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="text-sm font-semibold text-slate-700">
                  Resume text
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content..."
                    rows={10}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Job description
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description..."
                    rows={8}
                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleScore}
                    disabled={loadingScore}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {loadingScore ? "Scoring..." : "Analyze ATS"}
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={loadingGenerate}
                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-50"
                  >
                    {loadingGenerate ? "Generating..." : "Generate Variant"}
                  </button>
                  <button
                    onClick={handleSaveVariant}
                    disabled={saving}
                    className="rounded-md border border-slate-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Variant"}
                  </button>
                </div>
                {error && <p className="text-sm text-rose-600">{error}</p>}
                {success && <p className="text-sm text-emerald-600">{success}</p>}
              </div>

              {atsResult && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Missing keywords</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {atsResult.missing.length === 0 && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Great coverage
                      </span>
                    )}
                    {atsResult.missing.slice(0, 20).map((word) => (
                      <span
                        key={word}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Generated variant</div>
                <div className="mt-4 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {output ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown> : "No output yet."}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Saved variants</div>
                <div className="mt-4 space-y-3">
                  {variants.length === 0 && <p className="text-sm text-slate-500">No saved variants yet.</p>}
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900">
                          {variant.jobTitle || "Untitled role"}
                          {variant.company ? ` · ${variant.company}` : ""}
                        </div>
                        <div className="text-xs text-slate-500">
                          ATS {variant.atsScore ?? "--"}%
                        </div>
                      </div>
                      <div className="mt-2 line-clamp-3">{variant.content}</div>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
