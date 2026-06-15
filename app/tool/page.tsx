'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, ArrowRight, Download, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
type Step = 'upload' | 'questions' | 'processing' | 'results'

interface Strength {
  strength: string
  evidence: string
  interview_story: string
  relevance: string
}
interface Gap {
  gap: string
  impact: string
  action: string
  timeline: string
}
interface ActionItem {
  phase: string
  action: string
  category: string
  priority: string
  target_date: string
  notes: string
}
interface CareerSynthesis {
  name: string
  positioning_statement: string
  current_state: {
    role: string
    company: string
    experience: string
    domain: string
    ctc_approx: string
    notice_period: string
  }
  target_state: {
    roles: string[]
    sectors: string[]
    location: string
    salary_min: string
    salary_max: string
    salary_aspirational: string
    timeline: string
  }
  top_strengths: Strength[]
  key_gaps: Gap[]
  action_plan: ActionItem[]
}

// ── Progress bar ──────────────────────────────────────────────
const STEPS = ['Upload CV', 'Questions', 'Processing', 'Results']

function ProgressBar({ current }: { current: Step }) {
  const idx = { upload: 0, questions: 1, processing: 2, results: 3 }[current]
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
            i < idx ? 'text-white' : i === idx ? 'text-white' : 'bg-gray-100 text-gray-400'
          }`} style={i <= idx ? { background: '#1F4E79' } : {}}>
            {i < idx ? <CheckCircle size={14} /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${i === idx ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`w-8 h-0.5 mx-1 rounded ${i < idx ? 'bg-navy-mid' : 'bg-gray-200'}`} style={i < idx ? { background: '#2E75B6' } : {}} />}
        </div>
      ))}
    </div>
  )
}

// ── Upload Step ───────────────────────────────────────────────
function UploadStep({ onUpload }: { onUpload: (text: string, filename: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file) return
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      setError('Please upload a PDF or Word document.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/parse-cv', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to parse CV')
      onUpload(data.text, file.name)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Try again.')
    } finally {
      setLoading(false)
    }
  }, [onUpload])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your CV</h2>
      <p className="text-gray-500 mb-8">PDF or Word document. We'll read it and generate personalised questions.</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
          dragging ? 'border-navy-mid bg-navy-light' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
        style={dragging ? { borderColor: '#2E75B6', background: '#EBF3FB' } : {}}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin" style={{ color: '#1F4E79' }} />
            <p className="text-gray-600 font-medium">Parsing your CV…</p>
          </div>
        ) : (
          <>
            <Upload size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-gray-700 mb-1">Drop your CV here or click to browse</p>
            <p className="text-sm text-gray-400">Supports PDF and DOCX · Max 10MB</p>
          </>
        )}
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  )
}

// ── Questions Step ────────────────────────────────────────────
function QuestionsStep({ questions, onComplete }: {
  questions: string[]
  onComplete: (answers: string[]) => void
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''))
  const [text, setText] = useState('')

  const handleNext = () => {
    const updated = [...answers]
    updated[current] = text
    setAnswers(updated)

    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setText(updated[current + 1] || '')
    } else {
      onComplete(updated)
    }
  }

  const handleBack = () => {
    const updated = [...answers]
    updated[current] = text
    setAnswers(updated)
    setCurrent(current - 1)
    setText(updated[current - 1] || '')
  }

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Career reflection</h2>
        <span className="text-sm text-gray-400">{current + 1} of {questions.length}</span>
      </div>

      {/* progress track */}
      <div className="w-full h-1.5 rounded-full bg-gray-100 mb-8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: '#1F4E79' }} />
      </div>

      {/* AI avatar + question */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: '#1F4E79' }}>AI</div>
        <div className="flex-1 rounded-2xl rounded-tl-none px-5 py-4 text-gray-800 font-medium text-lg leading-relaxed"
          style={{ background: '#EBF3FB' }}>
          {questions[current]}
        </div>
      </div>

      {/* Answer area */}
      <textarea
        autoFocus
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your thoughts — be specific. The more context you give, the better your workbook will be…"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 text-sm resize-none focus:outline-none focus:ring-2 transition-shadow"
        style={{ '--tw-ring-color': '#2E75B6' } as React.CSSProperties}
        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleNext() }}
      />
      <p className="text-xs text-gray-400 mt-1 mb-6">Tip: Press Cmd+Enter to advance</p>

      <div className="flex items-center justify-between">
        {current > 0
          ? <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
          : <div />
        }
        <button
          onClick={handleNext}
          disabled={!text.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: '#1F4E79' }}
        >
          {current < questions.length - 1 ? 'Next question' : 'Generate my workbook'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Processing Step ───────────────────────────────────────────
function ProcessingStep() {
  const stages = [
    'Reading your career story…',
    'Identifying your strengths and patterns…',
    'Mapping gaps and opportunities…',
    'Building your 90-day action plan…',
    'Compiling your workbook…',
  ]
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setStage(s => Math.min(s + 1, stages.length - 1)), 2800)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="fade-in text-center py-12">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse"
        style={{ background: '#EBF3FB' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#1F4E79' }} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-3">Analysing your career</h2>
      <p className="text-gray-500 mb-8 text-sm">{stages[stage]}</p>
      <div className="flex justify-center gap-1">
        {stages.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= stage ? 'scale-100' : 'scale-75 opacity-30'}`}
            style={{ background: '#1F4E79' }} />
        ))}
      </div>
    </div>
  )
}

// ── Results Step ──────────────────────────────────────────────
function ResultsStep({ synthesis }: { synthesis: CareerSynthesis }) {
  const [downloading, setDownloading] = useState(false)
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/generate-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synthesis }),
      })
      if (!res.ok) throw new Error('Excel generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CareerCare_${synthesis.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fade-in">
      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-8" style={{ background: '#EBF3FB' }}>
        <CheckCircle size={24} style={{ color: '#1F4E79' }} />
        <div>
          <div className="font-semibold text-gray-900">Your career workbook is ready</div>
          <div className="text-sm text-gray-500">4 sheets covering your career snapshot, journey, strengths & gaps, and action plan</div>
        </div>
      </div>

      {/* Positioning statement */}
      <div className="mb-8 p-5 rounded-2xl border border-gray-100 bg-white">
        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#2E75B6' }}>Your positioning statement</div>
        <p className="text-gray-800 italic leading-relaxed">"{synthesis.positioning_statement}"</p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {/* Strengths preview */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#375623' }}>Top Strengths ({synthesis.top_strengths.length})</div>
          <ul className="space-y-2">
            {synthesis.top_strengths.slice(0, 3).map(s => (
              <li key={s.strength} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span className="text-gray-700">{s.strength}</span>
              </li>
            ))}
            {synthesis.top_strengths.length > 3 && (
              <li className="text-xs text-gray-400">+{synthesis.top_strengths.length - 3} more in the workbook</li>
            )}
          </ul>
        </div>

        {/* Gaps preview */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3 text-amber-600">Key Gaps ({synthesis.key_gaps.length})</div>
          <ul className="space-y-2">
            {synthesis.key_gaps.slice(0, 3).map(g => (
              <li key={g.gap} className="flex items-start gap-2 text-sm">
                <span className="text-amber-400 font-bold mt-0.5">!</span>
                <span className="text-gray-700">{g.gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Current state */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#1F4E79' }}>Current State</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{synthesis.current_state.role}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Experience</span><span className="font-medium text-gray-800">{synthesis.current_state.experience}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Domain</span><span className="font-medium text-gray-800 text-right max-w-[60%]">{synthesis.current_state.domain}</span></div>
          </div>
        </div>

        {/* Target state */}
        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3 text-green-700">Target State</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Target salary</span><span className="font-medium text-gray-800">{synthesis.target_state.salary_min} – {synthesis.target_state.salary_max}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Timeline</span><span className="font-medium text-gray-800">{synthesis.target_state.timeline}</span></div>
            <div><span className="text-gray-500">Roles: </span><span className="font-medium text-gray-800">{synthesis.target_state.roles.slice(0, 2).join(', ')}</span></div>
          </div>
        </div>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: '#1F4E79' }}
      >
        {downloading
          ? <><Loader2 size={20} className="animate-spin" /> Generating Excel…</>
          : <><Download size={20} /> Download my career workbook (Free)</>
        }
      </button>
      <p className="text-center text-xs text-gray-400 mt-2">Excel file · 4 sheets · Includes all your personalised data</p>

      {/* Paywall */}
      <div className="mt-10 p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} className="text-gray-400" />
          <span className="font-semibold text-gray-600">Unlock the full strategy</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Get 3 more sheets: <strong>15 target companies</strong> with real-time job openings,
          <strong> Open Roles Tracker</strong>, and your <strong>Network & Referrals map</strong> —
          powered by live web search.
        </p>
        {notified ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle size={16} /> Got it! We'll email you when it's live.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#2E75B6' } as React.CSSProperties}
            />
            <button
              onClick={() => { if (email.includes('@')) setNotified(true) }}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: '#1F4E79' }}
            >
              Notify me
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/tool" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Analyse a different CV
        </Link>
      </div>
    </div>
  )
}

// ── Main tool page ────────────────────────────────────────────
export default function ToolPage() {
  const [step, setStep] = useState<Step>('upload')
  const [cvText, setCvText] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [synthesis, setSynthesis] = useState<CareerSynthesis | null>(null)
  const [error, setError] = useState('')

  const handleUpload = async (text: string) => {
    setCvText(text)
    setError('')
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuestions(data.questions)
      setStep('questions')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate questions.')
    }
  }

  const handleAnswers = async (answers: string[]) => {
    setStep('processing')
    setError('')
    try {
      const res = await fetch('/api/synthesise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, questions, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSynthesis(data.synthesis)
      setStep('results')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Synthesis failed. Please try again.')
      setStep('questions')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
            <ArrowLeft size={16} /> CareerCare AI
          </Link>
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#1F4E79' }}>C</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <ProgressBar current={step} />

        {error && step !== 'processing' && (
          <div className="mb-6 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {step === 'upload' && <UploadStep onUpload={handleUpload} />}
        {step === 'questions' && questions.length > 0 && <QuestionsStep questions={questions} onComplete={handleAnswers} />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'results' && synthesis && <ResultsStep synthesis={synthesis} />}
      </div>
    </div>
  )
}
