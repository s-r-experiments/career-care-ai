import Link from 'next/link'
import { ArrowRight, FileText, MessageSquare, Download, Lock, Zap, Target, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy-DEFAULT flex items-center justify-center" style={{ background: '#1F4E79' }}>
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-gray-900">CareerCare AI</span>
        </div>
        <Link
          href="/tool"
          className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: '#1F4E79' }}
        >
          Start Free
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
          style={{ background: '#EBF3FB', borderColor: '#DEEAF1', color: '#1F4E79' }}>
          <Zap size={12} />
          Free — powered by AI, no sign-up needed
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Turn your CV into a<br />
          <span style={{ color: '#1F4E79' }}>complete career strategy</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your CV, answer 7 AI-personalised questions, and walk away with a structured career
          workbook — including your strengths, gaps, positioning statement, and a 90-day action plan.
        </p>
        <Link
          href="/tool"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-transform hover:scale-105"
          style={{ background: '#1F4E79' }}
        >
          Analyse my career — free
          <ArrowRight size={20} />
        </Link>
        <p className="text-sm text-gray-400 mt-4">Takes about 15 minutes. No sign-up required.</p>
      </section>

      {/* Steps */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, step: '01', title: 'Upload your CV', desc: 'PDF or Word doc. We extract your career history and read between the lines.' },
            { icon: MessageSquare, step: '02', title: 'Answer 7 questions', desc: 'AI-generated questions personalised to your CV — about motivations, peak moments, and goals.' },
            { icon: Download, step: '03', title: 'Download your workbook', desc: 'A structured Excel workbook with your career snapshot, strengths, gaps, and 90-day plan.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="relative p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: '#1F4E79' }}>
                {step}
              </div>
              <Icon size={28} style={{ color: '#2E75B6' }} className="mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free vs Paid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">What you get</h2>
        <p className="text-center text-gray-500 mb-12">Start for free. Unlock the full strategy when you're ready.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="p-8 rounded-2xl border-2 bg-white" style={{ borderColor: '#DEEAF1' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#EBF3FB', color: '#1F4E79' }}>FREE</div>
              <span className="font-semibold text-gray-900">Career Foundation</span>
            </div>
            <ul className="space-y-3">
              {[
                'Career Snapshot — positioning + current vs target state',
                'Career Journey — timeline with insights per era',
                'Strengths & Gaps — 5 validated strengths, 4 key gaps',
                '90-Day Action Plan (first 45 days)',
                'Downloadable Excel workbook',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="mt-0.5 text-green-500 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/tool"
              className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#1F4E79' }}
            >
              Start free <ArrowRight size={16} />
            </Link>
          </div>

          {/* Paid */}
          <div className="p-8 rounded-2xl border-2 bg-gray-50 relative overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
            <div className="absolute top-4 right-4">
              <Lock size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">COMING SOON</div>
              <span className="font-semibold text-gray-500">Full Strategy</span>
            </div>
            <ul className="space-y-3">
              {[
                { text: 'Everything in Free', locked: false },
                { text: '15-company target shortlist with real-time job openings', locked: true },
                { text: 'Open Roles Tracker with live data', locked: true },
                { text: 'Network & Referrals map', locked: true },
                { text: 'Salary benchmarking (real-time web data)', locked: true },
                { text: '90-Day Plan — full 90 days with company-specific actions', locked: true },
              ].map(({ text, locked }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  {locked
                    ? <Lock size={14} className="mt-0.5 text-gray-300 shrink-0" />
                    : <span className="mt-0.5 text-green-500 font-bold shrink-0">✓</span>
                  }
                  <span className={locked ? 'text-gray-400' : 'text-gray-700'}>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-gray-400 border border-gray-200 bg-white cursor-not-allowed">
              <Lock size={16} /> Notify me when available
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="px-6 py-16 text-center" style={{ background: '#EBF3FB' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Built for experienced professionals</h2>
          <p className="text-gray-500 mb-10">Not another resume keyword scanner. This is a structured career reflection tool for people with real depth — and real choices to make.</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Target, label: 'Personalised', desc: 'Questions tailored to your actual CV, not generic prompts' },
              { icon: Users, label: 'Context-aware', desc: 'Understands consulting, product, pharma, tech — your world' },
              { icon: Download, label: 'Actionable', desc: 'You leave with a plan, not just an assessment' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="text-center">
                <Icon size={24} style={{ color: '#1F4E79' }} className="mx-auto mb-2" />
                <div className="font-semibold text-gray-900 text-sm mb-1">{label}</div>
                <div className="text-gray-500 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <p>CareerCare AI · Free career intelligence tool · Powered by Groq + Claude</p>
      </footer>
    </div>
  )
}
