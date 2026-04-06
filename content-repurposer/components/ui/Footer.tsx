import Link from "next/link";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg" />
              <span className="font-bold">Architect.ai</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              AI-powered resume optimization for the modern job market.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-950 dark:text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              {["Features", "Pricing", "Security", "Roadmap"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-950 dark:text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-950 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              {["Privacy", "Terms", "Cookies", "Compliance"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
          <p>© {currentYear} Resume Architect AI. Built for East Africa.</p>
          <div className="flex items-center gap-4">
            {[
              { icon: Github, label: "GitHub", href: "#" },
              { icon: Linkedin, label: "LinkedIn", href: "#" },
              { icon: Twitter, label: "Twitter", href: "#" },
              { icon: Mail, label: "Email", href: "mailto:hello@architect.ai" },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}