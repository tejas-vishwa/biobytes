import Link from "next/link"
import { Activity, Mail, ShieldCheck, Heart, ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-slate-900 text-slate-200 py-12">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-teal-400" />
              <span className="font-bold text-xl tracking-tight text-white">QURIX BioBytes</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent health tracking, 100-biomarker OCR report parsing, instant doctor access sharing, and live hospital queue management.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>ABHA-Ready Architecture</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/patients" className="hover:text-teal-300 transition-colors">For Patients</Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-teal-300 transition-colors">For Doctors</Link>
              </li>
              <li>
                <Link href="/labs" className="hover:text-teal-300 transition-colors">Lab Partners</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-300 transition-colors">Sign In / Get Started</Link>
              </li>
            </ul>
          </div>

          {/* Contact Tab Column */}
          <div className="space-y-3 md:col-span-2 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Contact & Support</h4>
                <p className="text-xs text-slate-400">Reach out for inquiries, lab partnerships, or support.</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="mailto:Qurix.biobytes@gmail.com"
                className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-teal-500/30 text-teal-300 hover:text-white transition-all group font-medium text-sm shadow-inner"
              >
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-teal-400" />
                  <span className="font-mono text-sm">Qurix.biobytes@gmail.com</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              * Dedicated response team available for hospital integration & technical support.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 QURIX BioBytes e-Health Tracker. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built for intelligent healthcare with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
          </div>
        </div>
      </div>
    </footer>
  )
}
