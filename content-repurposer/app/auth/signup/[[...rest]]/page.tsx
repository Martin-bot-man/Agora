"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  const appearance = {
    variables: {
      colorPrimary: "#0f1115",
      colorText: "#0f1115",
      colorTextSecondary: "#6b7280",
      colorBackground: "#ffffff",
      colorInputBackground: "#f9fafb",
      borderRadius: "12px",
      fontFamily: "var(--font-inter), ui-sans-serif, system-ui",
    },
    elements: {
      card: "shadow-none border-0",
      headerTitle: "text-2xl font-semibold text-slate-900",
      headerSubtitle: "text-sm text-slate-500",
      formFieldLabel: "text-sm uppercase tracking-widest text-slate-400",
      formButtonPrimary: "bg-slate-900 hover:bg-slate-800 text-white rounded-full",
      formButtonReset: "text-slate-600 hover:text-slate-900",
      socialButtonsBlockButton: "border border-slate-200 rounded-full hover:bg-slate-50",
      socialButtonsBlockButtonText: "font-semibold text-slate-700",
      dividerLine: "bg-slate-200",
      dividerText: "text-slate-400 text-sm uppercase tracking-widest",
      formFieldInput: "bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10",
      footerActionLink: "text-slate-700 hover:text-slate-900",
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 text-slate-900">
      <div className="max-w-6xl mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Resume Architect</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
              Build a resume that wins.
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Private workspace, premium templates, and AI-first optimization.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">ATS-safe structure</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Keyword alignment</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Job board access</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">Download-ready PDFs</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
          <div className="mb-6 text-center">
            <div className="text-sm uppercase tracking-[0.35em] text-slate-400">Sign Up</div>
            <h2 className="mt-2 text-2xl font-semibold">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Start your private career studio.</p>
          </div>
          <SignUp
            path="/auth/signup"
            routing="path"
            signInUrl="/auth/login"
            afterSignUpUrl="/dashboard"
            appearance={appearance}
          />
        </div>
      </div>
    </main>
  );
}
