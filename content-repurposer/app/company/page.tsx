"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  slug: string;
  website?: string | null;
  description?: string | null;
};

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState("recruiter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to load companies.");
      setCompanies(Array.isArray(data?.companies) ? data.companies : []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreateCompany = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to create company.");
      setSuccess("Company created.");
      setName("");
      setWebsite("");
      setDescription("");
      await loadCompanies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberUserId.trim()) {
      setError("Enter a user ID to add.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/companies/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberUserId, role: memberRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to add member.");
      setSuccess("Team member added.");
      setMemberUserId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl bg-white/90 p-8 shadow-[0_30px_60px_rgba(15,23,42,0.15)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Company</div>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Corporate profile + team seats</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Create a company page, invite teammates, and publish branded roles.
              </p>
            </div>
            <Link
              href={companies[0] ? `/companies/${companies[0].slug}` : "/jobs"}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View company page
            </Link>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={handleCreateCompany} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Create company</div>
              <div className="mt-4 grid gap-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Website URL"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short company description"
                  rows={4}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create company"}
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Team seats</div>
              <p className="mt-3 text-sm text-slate-600">Add teammates by Clerk user ID.</p>
              <div className="mt-4 grid gap-3">
                <input
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  placeholder="clerk_user_id"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="recruiter">Recruiter</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={loading}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add member"}
                </button>
              </div>
              <div className="mt-6 text-sm text-slate-600">
                Active company:{" "}
                {companies[0] ? (
                  <span className="font-semibold text-slate-900">{companies[0].name}</span>
                ) : (
                  "None yet"
                )}
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {success && <p className="mt-4 text-sm text-emerald-600">{success}</p>}
        </div>
      </div>
    </main>
  );
}
