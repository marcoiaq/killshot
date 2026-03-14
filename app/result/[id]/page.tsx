'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Analysis {
  kill_score: number
  verdict: string
  hit_list: { title: string; detail: string }[]
  competitors: { name: string; reason: string }[]
  fatal_assumptions: { assumption: string; reality: string }[]
  survival_guide?: string[]
  cause_of_death?: string
}

function ScoreColor(score: number) {
  if (score > 60) return 'text-[#dc2626]'
  if (score > 40) return 'text-orange-400'
  return 'text-green-400'
}

function ScoreBorderColor(score: number) {
  if (score > 60) return 'border-[#dc2626]/30'
  if (score > 40) return 'border-orange-400/30'
  return 'border-green-400/30'
}

export default function ResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const paid = searchParams.get('paid')

  const [status, setStatus] = useState<'loading' | 'processing' | 'complete' | 'error'>('loading')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [idea, setIdea] = useState('')
  const [polls, setPolls] = useState(0)

  useEffect(() => {
    async function fetchResult() {
      try {
        const url = paid ? `/api/result/${id}?paid=true` : `/api/result/${id}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.status === 'complete') {
          setAnalysis(data.analysis)
          setIdea(data.idea)
          setStatus('complete')
        } else if (data.status === 'error') {
          setStatus('error')
        } else {
          setStatus('processing')
          setPolls((p) => p + 1)
        }
      } catch {
        setStatus('error')
      }
    }

    if (status !== 'complete' && status !== 'error') {
      const timeout = polls === 0 ? 0 : 3000
      const timer = setTimeout(fetchResult, timeout)
      return () => clearTimeout(timer)
    }
  }, [id, paid, polls, status])

  if (status === 'loading' || status === 'processing') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <nav className="fixed top-0 left-0 right-0 border-b border-white/10 px-6 py-4 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <Link href="/" className="text-xl font-bold tracking-tight">🎯 Killshot</Link>
          </div>
        </nav>
        <div className="text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-2xl font-bold mb-3">Loading your analysis...</h1>
          <p className="text-white/50 text-sm">
            {polls > 2 ? 'AI is working hard to destroy your idea. Almost there...' : 'Analyzing your idea...'}
          </p>
          <div className="mt-8 flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#dc2626] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (status === 'error' || !analysis) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <nav className="fixed top-0 left-0 right-0 border-b border-white/10 px-6 py-4 bg-[#0a0a0a]">
          <div className="max-w-5xl mx-auto">
            <Link href="/" className="text-xl font-bold tracking-tight">🎯 Killshot</Link>
          </div>
        </nav>
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-3">Analysis failed</h1>
          <p className="text-white/50 mb-6">Something went wrong. Please try again or contact support.</p>
          <Link href="/" className="bg-[#dc2626] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl">
            Try Again
          </Link>
        </div>
      </main>
    )
  }

  const score = analysis.kill_score
  const shareText = `My startup idea got a Kill Score of ${score}/100 on Killshot. Try yours → killshot.vercel.app #startups #buildinpublic`

  return (
    <main className="min-h-screen pb-20">
      <nav className="border-b border-white/10 px-6 py-4 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">🎯 Killshot</Link>
          <Link
            href="/"
            className="text-sm bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Another Idea
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6">
        {/* Score hero */}
        <div className={`border-b ${ScoreBorderColor(score)} py-16 text-center`}>
          <div className={`text-9xl font-black ${ScoreColor(score)} leading-none mb-4`}>
            {score}
          </div>
          <div className="text-sm font-mono text-white/40 uppercase tracking-widest mb-6">Kill Score</div>
          <div className={`text-3xl md:text-5xl font-black tracking-tight ${ScoreColor(score)}`}>
            {analysis.verdict}
          </div>
          {idea && (
            <p className="text-white/40 text-sm mt-6 max-w-xl mx-auto italic">&quot;{idea}&quot;</p>
          )}
        </div>

        {/* The Hit List */}
        <section className="py-10 border-b border-white/10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#dc2626] mb-6">
            01 · The Hit List
          </h2>
          <div className="space-y-4">
            {analysis.hit_list.map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-[#dc2626] font-mono text-sm font-bold shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Competitor Threats */}
        <section className="py-10 border-b border-white/10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#dc2626] mb-6">
            02 · Competitor Threats
          </h2>
          <div className="space-y-3">
            {analysis.competitors.map((comp, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex gap-4">
                <span className="text-white/20 font-mono text-sm shrink-0 mt-0.5">{i + 1}.</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{comp.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{comp.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fatal Assumptions */}
        <section className="py-10 border-b border-white/10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#dc2626] mb-6">
            03 · Fatal Assumptions
          </h2>
          <div className="space-y-4">
            {analysis.fatal_assumptions.map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                <div className="mb-3">
                  <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Assumption</span>
                  <p className="text-white font-medium mt-1">{item.assumption}</p>
                </div>
                <div>
                  <span className="text-xs font-mono text-[#dc2626] uppercase tracking-wider">Reality</span>
                  <p className="text-white/60 text-sm mt-1 leading-relaxed">{item.reality}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Survival Guide or Cause of Death */}
        {score > 40 && analysis.survival_guide && analysis.survival_guide.length > 0 ? (
          <section className="py-10 border-b border-white/10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-green-400 mb-6">
              04 · Survival Guide
            </h2>
            <div className="space-y-3">
              {analysis.survival_guide.map((tip, i) => (
                <div key={i} className="bg-green-400/5 border border-green-400/20 rounded-xl p-5 flex gap-4">
                  <span className="text-green-400 font-bold text-sm shrink-0">{i + 1}.</span>
                  <p className="text-white/80 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        ) : score <= 40 && analysis.cause_of_death ? (
          <section className="py-10 border-b border-white/10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#dc2626] mb-6">
              04 · Cause of Death
            </h2>
            <div className="bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-xl p-6">
              <p className="text-white/80 leading-relaxed">{analysis.cause_of_death}</p>
            </div>
          </section>
        ) : null}

        {/* Share + CTA */}
        <section className="py-10">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
            <p className="text-white/60 text-sm mb-4">
              Share your Kill Score
            </p>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-white/90 transition-colors mb-4 mr-3"
            >
              Share on X/Twitter
            </a>
            <Link
              href="/"
              className="inline-block bg-[#dc2626] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Try Another Idea →
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
