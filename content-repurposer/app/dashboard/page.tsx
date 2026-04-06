"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { PlanStatusWidget } from "@/components/billing/plan-status-widget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dashboardBg from "@/assets/photocollage.png";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Download,
  FileUp,
  Flame,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

const stages = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "final", label: "Final Round" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
];

type Job = {
  id: string;
  stage: "saved" | "applied" | "interview" | "final" | "offer" | "rejected";
  title: string;
  company: string;
  location: string;
  salary: string;
  notes: string;
  jd: string;
  updatedAt?: string;
};

type Reminder = {
  id: string;
  jobTrackerId: string;
  note: string;
  remindAt: string;
  completedAt?: string | null;
};

const stageLabels: Record<Job["stage"], string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  final: "Final Round",
  offer: "Offer",
  rejected: "Rejected",
};

export default function DashboardPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [step, setStep] = useState("full_resume");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [error, setError] = useState("");
  const [trackerError, setTrackerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderNote, setReminderNote] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [reminderSaving, setReminderSaving] = useState(false);
  const [autoTailor, setAutoTailor] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const saveTimerRef = useRef<number | null>(null);
  const jobListRef = useRef<Job[]>([]);
  const isPremiumLocked = trackerError.toLowerCase().includes("premium");

  const gatePremium = () => {
    if (isPremiumLocked) {
      setShowUpgrade(true);
      return true;
    }
    return false;
  };

  const formatUpdated = (iso?: string) => {
    if (!iso) return "Just now";
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const formatReminderDate = (iso?: string) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleString();
  };

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const loadReminders = async () => {
    try {
      const res = await fetch("/api/tracker/reminders");
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error || "Access restricted.");
      }
      const items = Array.isArray(data?.reminders) ? data.reminders : [];
      setReminders(items);
    } catch (err: any) {
      setTrackerError(err.message);
    }
  };

  useEffect(() => {
    jobListRef.current = jobList;
  }, [jobList]);

  const insights = useMemo(() => {
    const applications = jobList.length;
    const interviews = jobList.filter((job) => job.stage === "interview" || job.stage === "final").length;
    const offers = jobList.filter((job) => job.stage === "offer").length;
    const responseRate = applications > 0 ? Math.round((interviews / applications) * 100) : 0;
    return [
      { label: "Applications", value: String(applications), icon: Briefcase },
      { label: "Interviews", value: String(interviews), icon: CalendarDays },
      { label: "Offers", value: String(offers), icon: Star },
      { label: "Response Rate", value: `${responseRate}%`, icon: TrendingUp },
    ];
  }, [jobList]);

  const toCalendarTimestamp = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const buildCalendarUrl = (title: string, details: string, start: Date, end: Date) => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      details,
      dates: `${toCalendarTimestamp(start)}/${toCalendarTimestamp(end)}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const upcoming = useMemo(() => {
    const priority = ["interview", "final", "offer", "applied", "saved"] as const;
    const stageRank = new Map(priority.map((stage, index) => [stage, index]));
    return [...jobList]
      .filter((job) => job.stage !== "rejected")
      .sort((a, b) => (stageRank.get(a.stage) ?? 99) - (stageRank.get(b.stage) ?? 99))
      .slice(0, 3)
      .map((job, idx) => {
        const base = new Date();
        const daysAhead = idx === 0 ? 1 : idx === 1 ? 2 : 4;
        const start = new Date(base);
        start.setDate(base.getDate() + daysAhead);
        start.setHours(10, 0, 0, 0);
        const end = new Date(start);
        end.setHours(10, 45, 0, 0);
        return {
          title: stageLabels[job.stage],
          company: job.company,
          time: idx === 0 ? "Next up" : idx === 1 ? "Coming soon" : "Later this week",
          calendarUrl: buildCalendarUrl(
            `${stageLabels[job.stage]} · ${job.company}`,
            `Role: ${job.title}\nStage: ${stageLabels[job.stage]}`,
            start,
            end
          ),
        };
      });
  }, [jobList]);

  const weeklyFocus = useMemo(() => {
    const applied = jobList.filter((job) => job.stage === "applied").length;
    const saved = jobList.filter((job) => job.stage === "saved").length;
    const interviews = jobList.filter((job) => job.stage === "interview" || job.stage === "final").length;
    const offers = jobList.filter((job) => job.stage === "offer").length;

    const actions: { icon: typeof CheckCircle2; text: string; tone: "emerald" | "blue" | "amber" }[] = [];

    if (jobList.length === 0) {
      actions.push({ icon: CheckCircle2, text: "Add 3 roles to start your pipeline.", tone: "emerald" });
      actions.push({ icon: Target, text: "Paste a job description to generate ATS keywords.", tone: "blue" });
      actions.push({ icon: MessageSquare, text: "Set a follow‑up reminder for your first application.", tone: "amber" });
      return actions;
    }

    if (saved > 0 && applied === 0) {
      actions.push({ icon: Target, text: "Apply to 2 saved roles this week.", tone: "blue" });
    }

    if (applied > 0 && interviews === 0) {
      actions.push({ icon: MessageSquare, text: "Send follow‑ups to your last 2 applications.", tone: "amber" });
    }

    if (interviews > 0) {
      actions.push({ icon: CheckCircle2, text: "Prepare interview notes for your next round.", tone: "emerald" });
    }

    if (offers > 0) {
      actions.push({ icon: Target, text: "Review offer details and negotiate priorities.", tone: "blue" });
    }

    if (actions.length < 3) {
      actions.push({ icon: CheckCircle2, text: "Tailor your resume to the top role in your pipeline.", tone: "emerald" });
    }

    return actions.slice(0, 3);
  }, [jobList]);

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return jobList;
    const q = query.toLowerCase();
    return jobList.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
    );
  }, [jobList, query]);

  const selectedJob = useMemo(
    () => jobList.find((job) => job.id === selectedId),
    [jobList, selectedId]
  );

  const extractKeywords = (text: string) => {
    const stopwords = new Set([
      "the","and","for","with","that","this","from","your","you","are","our","their","they","will","have","has","had","was","were","been",
      "role","team","work","working","ability","skills","skill","experience","years","year","strong","good","great","excellent",
      "looking","seeking","required","preferred","responsibilities","responsibility","include","including","must","should","nice",
      "using","use","used","within","across","into","about","per","via","etc","etc."
    ]);
    return Array.from(
      new Set(
        text
          .toLowerCase()
          .replace(/[^a-z0-9\\s]/g, " ")
          .split(/\\s+/)
          .filter((w) => w.length >= 3 && !stopwords.has(w))
      )
    );
  };

  const jdKeywords = useMemo(() => extractKeywords(jobDescription), [jobDescription]);
  const resumeKeywords = useMemo(() => extractKeywords(resumeText), [resumeText]);

  const readiness = useMemo(() => {
    if (jdKeywords.length === 0) return { score: 0, status: "Add JD", missing: [] as string[] };
    const resumeSet = new Set(resumeKeywords);
    const matches = jdKeywords.filter((k) => resumeSet.has(k));
    const missing = jdKeywords.filter((k) => !resumeSet.has(k));
    const score = Math.round((matches.length / jdKeywords.length) * 100);
    const status = score >= 70 ? "Apply" : score >= 45 ? "Wait" : "Fix";
    return { score, status, missing };
  }, [jdKeywords, resumeKeywords]);

  const heatmap = useMemo(() => {
    const resumeSet = new Set(resumeKeywords);
    return jdKeywords.map((k) => ({
      keyword: k,
      present: resumeSet.has(k),
    }));
  }, [jdKeywords, resumeKeywords]);

  useEffect(() => {
    const loadJobs = async () => {
      setTrackerError("");
      try {
        const res = await fetch("/api/tracker/jobs");
        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error(data?.error || "Access restricted.");
        }
        const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
        setJobList(jobs);
        setSelectedId(jobs[0]?.id ?? "");
        await loadReminders();
      } catch (err: any) {
        setTrackerError(err.message);
      }
    };
    loadJobs();
  }, []);

  const handleAddJob = async () => {
    if (gatePremium()) {
      const draftJob: Job = {
        id: `draft-${Date.now()}`,
        stage: "saved",
        title: "New Role",
        company: "Company Name",
        location: "Remote",
        salary: "TBD",
        notes: "Add notes about the role, recruiter, and next steps.",
        jd: "Paste the job description here.",
      };
      setJobList((prev) => [draftJob, ...prev]);
      setSelectedId(draftJob.id);
      return;
    }
    setTrackerError("");
    setSaving(true);
    try {
      const res = await fetch("/api/tracker/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "saved",
          title: "New Role",
          company: "Company Name",
          location: "Remote",
          salary: "TBD",
          notes: "Add notes about the role, recruiter, and next steps.",
          jd: "Paste the job description here.",
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || "Access restricted.");
      setJobList((prev) => [data.job, ...prev]);
      setSelectedId(data.job.id);
    } catch (err: any) {
      setTrackerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedJob = (patch: Partial<Job>) => {
    if (!selectedId) return;
    setJobList((prev) =>
      prev.map((job) => (job.id === selectedId ? { ...job, ...patch } : job))
    );

    if (gatePremium()) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      const job = jobListRef.current.find((item) => item.id === selectedId);
      if (!job) return;
      setSaving(true);
      try {
        const res = await fetch(`/api/tracker/jobs/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: patch.title ?? job.title,
            company: patch.company ?? job.company,
            stage: (patch.stage ?? job.stage) as Job["stage"],
            location: patch.location ?? job.location,
            salary: patch.salary ?? job.salary,
            notes: patch.notes ?? job.notes,
            jd: patch.jd ?? job.jd,
          }),
        });
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.error || "Access restricted.");
        if (data?.job) {
          setJobList((prev) => prev.map((item) => (item.id === selectedId ? data.job : item)));
        }
      } catch (err: any) {
        setTrackerError(err.message);
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  const deleteSelectedJob = async () => {
    if (!selectedId) return;
    if (gatePremium()) {
      setJobList((prev) => prev.filter((job) => job.id !== selectedId));
      setSelectedId((prev) => {
        const remaining = jobList.filter((job) => job.id !== prev);
        return remaining[0]?.id ?? "";
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/tracker/jobs/${selectedId}`, { method: "DELETE" });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || "Access restricted.");
      setJobList((prev) => prev.filter((job) => job.id !== selectedId));
      setSelectedId((prev) => {
        const remaining = jobList.filter((job) => job.id !== prev);
        return remaining[0]?.id ?? "";
      });
    } catch (err: any) {
      setTrackerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReminder = async () => {
    if (gatePremium()) return;
    if (!selectedId) return setTrackerError("Select a job to add a reminder.");
    if (!reminderAt.trim() || !reminderNote.trim()) {
      return setTrackerError("Reminder date and note are required.");
    }
    setReminderSaving(true);
    try {
      const res = await fetch("/api/tracker/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTrackerId: selectedId,
          remindAt: reminderAt,
          note: reminderNote,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.error || "Unable to add reminder.");
      }
      setReminderNote("");
      setReminderAt("");
      await loadReminders();
    } catch (err: any) {
      setTrackerError(err.message);
    } finally {
      setReminderSaving(false);
    }
  };

  const handleTailorFromJob = async () => {
    if (!selectedJob) return;
    setJobDescription(selectedJob.jd || "");
    setStep("full_resume");
    setAutoTailor(true);
  };

  useEffect(() => {
    if (autoTailor && resumeText.trim() && jobDescription.trim()) {
      handleGenerate().finally(() => setAutoTailor(false));
    }
  }, [autoTailor, resumeText, jobDescription]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingPdf(true);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { getPDFText } = await import("../../lib/pdf-parser");
      const extractedText = await getPDFText(arrayBuffer);
      setResumeText(extractedText);
    } catch (err) {
      console.error("PDF Error:", err);
      setError("Parsing failed. Please copy-paste your resume text instead.");
    } finally {
      setParsingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadAsPDF = async () => {
    if (!output) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const cleanContent = output.replace(/[#*]/g, "");
      const splitText = doc.splitTextToSize(cleanContent, 170);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("ARCHITECTED OUTPUT", 20, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(splitText, 20, 30);
      doc.save("optimized-resume.pdf");
    } catch (err) {
      setError("PDF Export failed.");
    }
  };

  const handleGenerate = async () => {
    if (gatePremium()) {
      return;
    }
    if (!resumeText.trim()) return setError("Resume text is required.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, step }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-12 font-sans text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${dashboardBg.src})` }}
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-24 max-w-md rounded-3xl bg-black/45 p-6 text-left backdrop-blur-sm md:left-10 md:top-28 md:p-8">
          <p className="text-xl font-black uppercase tracking-[0.12em] text-amber-200 md:text-2xl">
            Join 200,000+ professionals already using Resume Architect.
          </p>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl space-y-10 rounded-3xl bg-white/70 p-6 backdrop-blur-md md:p-8">
        {showUpgrade && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
              <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.2)]">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
                  Premium Only
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  Unlock the Job Tracker
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  Sync your pipeline across devices, get ATS-optimized output, and move from
                  application to interview faster.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="/pricing"
                    className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Upgrade to Premium
                  </a>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Continue preview
                  </button>
                  <span className="text-sm text-slate-500">$19/mo · Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {isPremiumLocked ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Premium
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">Unlock the full Job Tracker</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Sync your pipeline across devices, unlock ATS optimization, and move faster.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                  $19/mo · Cancel anytime
                </div>
                <a
                  href="/pricing"
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Upgrade to Premium
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">New here? Start with these 3 steps.</div>
                <ol className="mt-3 list-decimal pl-5 space-y-1 text-sm text-slate-600">
                  <li>Add a job to your pipeline.</li>
                  <li>Paste your resume and target job description.</li>
                  <li>Click Recompile to generate ATS‑optimized output.</li>
                </ol>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                Estimated setup: 3 min
              </div>
            </div>
          </div>
        )}
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Dashboard
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">Job Tracker</h1>
              <p className="text-sm text-slate-600">Track applications, optimize resumes, and move faster.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PlanStatusWidget />
              <div className="flex flex-col items-start gap-1">
                <Button
                  onClick={handleAddJob}
                  className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  disabled={saving}
                >
                  <Briefcase size={14} className="mr-2" /> Add Job
                </Button>
                <span className="text-sm text-slate-500 min-h-[20px]">
                  {saving ? "Saving…" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex w-full flex-col gap-1 md:w-80">
            <label htmlFor="job-search" className="sr-only">
              Search jobs
            </label>
            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <Search size={14} />
            <input
              id="job-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs..."
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              aria-describedby="job-search-help"
            />
            </div>
            <p id="job-search-help" className="text-sm text-slate-500">
              Search by role, company, or location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {insights.map((item) => (
            <Card key={item.label} className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-widest text-slate-400">{item.label}</div>
                  <div className="text-2xl font-semibold text-slate-900">{item.value}</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <item.icon size={18} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <fieldset disabled={false} className={isPremiumLocked ? "opacity-80" : ""}>
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pipeline</CardTitle>
                <CardDescription>Track job stages at a glance. Select a card to edit details.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Flame size={14} className="text-orange-500" /> Active streak 6 days
              </div>
            </CardHeader>
            <CardContent>
              {isPremiumLocked && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  Premium required to manage your pipeline. Upgrade to sync jobs across devices.
                </div>
              )}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span>Tip: Click a job card to view details. Use “Add Job” to create your first entry.</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600">
                  {jobList.length} total
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
                {stages.map((stage) => (
                  <div key={stage.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                    <div className="flex items-center justify-between text-sm uppercase tracking-widest text-slate-500">
                      <span>{stage.label}</span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-sm font-semibold text-slate-600">
                        {filteredJobs.filter((job) => job.stage === stage.id).length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {filteredJobs
                        .filter((job) => job.stage === stage.id)
                        .map((job) => (
                          <button
                            key={job.id}
                            onClick={() => setSelectedId(job.id)}
                            className={`w-full text-left rounded-xl border p-3 transition-all ${
                              selectedId === job.id
                                ? "border-slate-900 bg-white text-slate-900 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-400"
                            }`}
                          >
                            <div className="text-sm font-semibold">{job.title}</div>
                            <div className={`text-sm ${selectedId === job.id ? "text-slate-600" : "text-slate-500"}`}>
                              {job.company}
                            </div>
                            <div className={`mt-2 text-sm ${selectedId === job.id ? "text-slate-500" : "text-slate-400"}`}>
                              Updated {formatUpdated(job.updatedAt)}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Interview schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No upcoming items yet. Add jobs to your pipeline to see next steps here.
                  </div>
                ) : (
                  upcoming.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <a
                      href={item.calendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 w-10 rounded-lg bg-slate-900/10 text-slate-900 flex items-center justify-center hover:bg-slate-900/20"
                      title="Add to Google Calendar"
                    >
                      <Clock3 size={16} />
                    </a>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500">{item.company}</div>
                    </div>
                    <div className="ml-auto text-sm text-slate-500">{item.time}</div>
                  </div>
                ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle>Reminders</CardTitle>
                <CardDescription>Follow-ups and nudges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <input
                    type="datetime-local"
                    value={reminderAt}
                    onChange={(e) => setReminderAt(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  <input
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder={selectedJob ? `Follow up with ${selectedJob.company}` : "Reminder note"}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  <Button onClick={handleCreateReminder} disabled={reminderSaving} className="w-full">
                    {reminderSaving ? "Saving..." : "Add reminder"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {reminders.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      No reminders yet. Add one to stay on top of follow-ups.
                    </div>
                  ) : (
                    reminders.slice(0, 4).map((reminder) => {
                      const job = jobList.find((item) => item.id === reminder.jobTrackerId);
                      return (
                        <div key={reminder.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-sm font-semibold text-slate-900">{reminder.note}</div>
                          <div className="text-xs text-slate-500">
                            {job ? `${job.title} · ${job.company}` : "Job removed"}
                          </div>
                          <div className="mt-2 text-xs text-slate-500">{formatReminderDate(reminder.remindAt)}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Weekly Focus</CardTitle>
                    <CardDescription>High-impact actions</CardDescription>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                    Playbook
                  </span>
                </div>
              </CardHeader>
              <div className="border-t border-slate-100" />
              <CardContent className="space-y-3 text-sm text-slate-600">
                {weeklyFocus.map((item, index) => (
                  <div key={`${item.text}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <item.icon
                      size={16}
                      className={
                        item.tone === "emerald"
                          ? "text-emerald-500"
                          : item.tone === "blue"
                          ? "text-blue-500"
                          : "text-amber-500"
                      }
                    />
                    {item.text}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        </fieldset>

        <fieldset disabled={false} className={isPremiumLocked ? "opacity-80" : ""}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-6">
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Deep-dive and optimize</CardDescription>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                  Pipeline
                </span>
              </div>
            </CardHeader>
            <div className="border-t border-slate-100" />
            <CardContent className="space-y-5">
              {selectedJob ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-900/10 text-slate-900 flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="job-title">Role title</Label>
                        <input
                          id="job-title"
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={selectedJob.title}
                          onChange={(e) => updateSelectedJob({ title: e.target.value })}
                          placeholder="Role title"
                          aria-describedby="job-title-help"
                        />
                        <p id="job-title-help" className="text-sm text-slate-500">
                          Use the exact title from the job posting.
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="job-company">Company</Label>
                        <input
                          id="job-company"
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={selectedJob.company}
                          onChange={(e) => updateSelectedJob({ company: e.target.value })}
                          placeholder="Company"
                          aria-describedby="job-company-help"
                        />
                        <p id="job-company-help" className="text-sm text-slate-500">
                          The hiring company or agency name.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="space-y-1">
                      <Label htmlFor="job-location">Location</Label>
                      <input
                        id="job-location"
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={selectedJob.location}
                        onChange={(e) => updateSelectedJob({ location: e.target.value })}
                        placeholder="Location"
                        aria-describedby="job-location-help"
                      />
                      <p id="job-location-help" className="text-sm text-slate-500">
                        City, state, or “Remote”.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="job-salary">Salary</Label>
                      <input
                        id="job-salary"
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                        value={selectedJob.salary}
                        onChange={(e) => updateSelectedJob({ salary: e.target.value })}
                        placeholder="Salary"
                        aria-describedby="job-salary-help"
                      />
                      <p id="job-salary-help" className="text-sm text-slate-500">
                        Add a range if available.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="job-stage">Stage</Label>
                      <Select
                        value={selectedJob.stage}
                        onValueChange={(value) => updateSelectedJob({ stage: value })}
                      >
                        <SelectTrigger
                          id="job-stage"
                          className="bg-white border border-slate-200 h-10 rounded-md px-3 text-sm uppercase tracking-widest"
                          aria-describedby="job-stage-help"
                        >
                          <SelectValue placeholder="Stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p id="job-stage-help" className="text-sm text-slate-500">
                        Track where this role is in your pipeline.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="job-notes">Notes</Label>
                    <textarea
                      id="job-notes"
                      className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                      value={selectedJob.notes}
                      onChange={(e) => updateSelectedJob({ notes: e.target.value })}
                      rows={4}
                      placeholder="Add notes about this role, culture fit, or referral details..."
                      aria-describedby="job-notes-help"
                    />
                    <p id="job-notes-help" className="text-sm text-slate-500">
                      Capture recruiter details, follow‑ups, and key context.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-description" className="text-sm uppercase font-semibold text-slate-400 tracking-widest">
                      Job Description
                    </Label>
                    <textarea
                      id="job-description"
                      className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                      value={selectedJob.jd}
                      onChange={(e) => updateSelectedJob({ jd: e.target.value })}
                      rows={6}
                      placeholder="Paste the job description here..."
                      aria-describedby="job-description-help"
                    />
                    <p id="job-description-help" className="text-sm text-slate-500">
                      Full text improves ATS keyword matching.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleTailorFromJob}
                      className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
                    >
                      Tailor Resume for This Job
                    </button>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm uppercase tracking-widest ${readiness.status === "Apply" ? "bg-emerald-100 text-emerald-700" : readiness.status === "Wait" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {readiness.status}
                      </span>
                      <span>Readiness {readiness.score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={12} /> Updated {formatUpdated(selectedJob.updatedAt)}
                    </span>
                    <button
                      onClick={deleteSelectedJob}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  <div className="text-sm font-semibold text-slate-900">No job selected</div>
                  <p className="mt-2 text-sm text-slate-600">
                    Select a job from the pipeline to view details, or click “Add Job” to create your first entry.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resume Optimizer</CardTitle>
                  <CardDescription>Paste your resume + a job description to generate ATS-safe output.</CardDescription>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  ATS Boost
                </span>
              </div>
            </CardHeader>
            <div className="border-t border-slate-100" />
            <CardContent className="space-y-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
              >
                {parsingPdf ? <Loader2 className="mx-auto animate-spin text-slate-600" /> : <FileUp className="mx-auto text-slate-400" />}
                <p className="mt-2 text-sm font-semibold text-slate-700">Upload Resume PDF</p>
                <p className="mt-1 text-sm text-slate-500">Optional: You can also paste text below.</p>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume-text" className="text-sm uppercase font-semibold text-slate-400 tracking-widest">
                  Original Resume
                </Label>
                <textarea
                  id="resume-text"
                  placeholder="Paste resume content..."
                  className="h-28 max-h-28 w-full text-sm font-mono bg-slate-50 border border-slate-200 resize-none overflow-y-auto p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  aria-describedby="resume-text-help"
                />
                <p id="resume-text-help" className="text-sm text-slate-500">
                  Paste the full resume for best results.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-jd" className="text-sm uppercase font-semibold text-slate-400 tracking-widest">
                  Target Job Description
                </Label>
                <textarea
                  id="target-jd"
                  placeholder="Paste JD here..."
                  className="h-28 max-h-28 w-full text-sm font-mono bg-slate-50 border border-slate-200 resize-none overflow-y-auto p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  aria-describedby="target-jd-help"
                />
                <p id="target-jd-help" className="text-sm text-slate-500">
                  Include responsibilities and requirements.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="output-type" className="text-sm uppercase font-semibold text-slate-400 tracking-widest">
                  Output type
                </Label>
                <Select value={step} onValueChange={setStep}>
                  <SelectTrigger
                    id="output-type"
                    className="bg-slate-900 text-white border-none h-11 rounded-md px-4 font-semibold text-sm uppercase tracking-widest"
                    aria-describedby="output-type-help"
                  >
                    <SelectValue placeholder="Select output" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rewrite">Professional Rewrite</SelectItem>
                    <SelectItem value="audit">Brutal ATS Audit</SelectItem>
                    <SelectItem value="ats_optimize">Keyword Injection</SelectItem>
                    <SelectItem value="full_resume">Ultra-Modern Resume</SelectItem>
                  </SelectContent>
                </Select>
                <p id="output-type-help" className="text-sm text-slate-500">
                  Choose the output style for your resume.
                </p>
              </div>

              <Button onClick={handleGenerate} className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 rounded-md font-semibold text-sm uppercase tracking-widest" disabled={loading || parsingPdf}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={16} />}
                Recompile
              </Button>
              <p className="text-sm text-slate-500">Tip: For best results, paste the full job description.</p>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-semibold border border-red-100 uppercase flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </fieldset>

        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Architected Output</CardTitle>
              <CardDescription>Use this for submissions</CardDescription>
            </div>
            {output && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadAsPDF} className="rounded-md border-slate-200 font-semibold text-sm uppercase px-4 h-9 shadow-sm bg-white">
                  <Download size={14} className="mr-2 text-blue-600" /> PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(output)} className="rounded-md w-9 h-9 p-0 text-slate-300 hover:text-blue-600">
                  <ClipboardCopy size={16} />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm uppercase tracking-widest text-slate-400">Readiness Score</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-2xl font-semibold text-slate-900">{readiness.score}%</div>
                  <span className={`rounded-full px-3 py-1 text-sm uppercase tracking-widest ${readiness.status === "Apply" ? "bg-emerald-100 text-emerald-700" : readiness.status === "Wait" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {readiness.status}
                  </span>
                </div>
                {readiness.missing.length > 0 && (
                  <div className="mt-2 text-sm text-slate-500">
                    Missing: {readiness.missing.slice(0, 8).join(", ")}
                    {readiness.missing.length > 8 ? "..." : ""}
                  </div>
                )}
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm uppercase tracking-widest text-slate-400">ATS Keyword Heatmap</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {heatmap.length === 0 && <span className="text-sm text-slate-400">Add a JD to see keywords.</span>}
                  {heatmap.slice(0, 18).map((item) => (
                    <span
                      key={item.keyword}
                      className={`rounded-full px-3 py-1 text-sm uppercase tracking-widest ${item.present ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {item.keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Tabs defaultValue="optimized">
              <TabsList className="bg-slate-200/50 p-1 rounded-md">
                <TabsTrigger value="optimized" className="rounded-md px-6 font-semibold text-sm uppercase tracking-widest">Result</TabsTrigger>
                <TabsTrigger value="original" className="rounded-md px-6 font-semibold text-sm uppercase tracking-widest text-slate-400">Raw Source</TabsTrigger>
              </TabsList>
              <TabsContent value="optimized" className="mt-4">
                <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-strong:text-blue-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                </div>
              </TabsContent>
              <TabsContent value="original" className="mt-4">
                <pre className="whitespace-pre-wrap text-[11px] text-slate-500 font-mono leading-relaxed bg-slate-50 p-6 rounded-md border border-slate-100">
                  {resumeText || "SYSTEM_READY: Waiting for input."}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
