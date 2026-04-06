"use client";

import { useEffect, useMemo, useState } from "react";

type Candidate = {
  id: string;
  name: string;
  role: string;
  status: "sourced" | "screen" | "interview" | "offer" | "hired" | "rejected";
  email?: string | null;
  notes?: string | null;
};

const stages: Candidate["status"][] = ["sourced", "screen", "interview", "offer", "hired", "rejected"];

export default function RecruiterPipelinePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<Candidate["status"]>("sourced");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCandidates = async () => {
    try {
      const res = await fetch("/api/recruiter/candidates");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load candidates.");
      setCandidates(Array.isArray(data?.candidates) ? data.candidates : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recruiter/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, status, email, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to add candidate.");
      setName("");
      setRole("");
      setEmail("");
      setNotes("");
      await loadCandidates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidateId: string, nextStatus: Candidate["status"]) => {
    try {
      const res = await fetch(`/api/recruiter/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to update status.");
      setCandidates((prev) => prev.map((item) => (item.id === candidateId ? data.candidate : item)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const grouped = useMemo(
    () => stages.map((stage) => ({ stage, items: candidates.filter((c) => c.status === stage) })),
    [candidates]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl bg-white/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Recruiter</div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Candidate pipeline</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Move candidates through the funnel with quick status updates.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[1fr_1fr_1fr_1fr]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Candidate name"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target role"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Candidate["status"])}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows={2}
              className="col-span-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="col-span-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add candidate"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {grouped.map((column) => (
              <div key={column.stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{column.stage}</div>
                <div className="mt-3 space-y-3">
                  {column.items.length === 0 && <p className="text-xs text-slate-500">No candidates</p>}
                  {column.items.map((candidate) => (
                    <div key={candidate.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-sm font-semibold text-slate-900">{candidate.name}</div>
                      <div className="text-xs text-slate-500">{candidate.role}</div>
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id, e.target.value as Candidate["status"])}
                        className="mt-3 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
