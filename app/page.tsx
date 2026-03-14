'use client'

import { useState } from 'react'

const EXAMPLES = [
  {
    idea: 'A marketplace app where local artisans sell handmade crafts directly to consumers, cutting out Etsy.',
    score: 82,
    verdict: 'DEAD ON ARRIVAL',
    topHit: 'Amazon Handmade dominates with 300M+ buyers. Etsy has 90M active buyers. You have zero.',
  },
  {
    idea: 'B2B SaaS for construction companies to manage subcontractor payments and compliance documentation.',
    score: 34,
    verdict: 'SURVIVED',
    topHit: 'Niche is real but sales cycles are brutal — 6-18 months to close enterprise. Survived, barely.',
  },
  {
    idea: 'A social app where users post 10-second video reactions to news headlines. Monetized via ads.',
    score: 95,
    verdict: 'DEAD ON ARRIVAL',
    topHit: 'TikTok already does this. Instagram Reels already does this. You have no distribution.',
  },
]

export default function Home() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idea.trim() || idea.trim().length < 20) {
      setError('Please describe your idea in at least 20 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">🎯 Killshot</span>
          <span className="text-sm text-white/40">$5 per analysis</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16">
        <div className="mb-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#dc2626] border border-[#dc2626]/30 px-3 py-1 rounded-full">
            Brutal. Honest. Necessary.
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mt-6 mb-4">
          We&apos;ll Try to Kill<br />
          <span className="text-[#dc2626]">Your Startup Idea.</span>
        </h1>
        <p className="text-xl text-white/60 mb-10">
          If it survives, it might actually be worth building.{' '}
          <span className="text-white font-semibold">$5.</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea... Be specific. The more detail, the more brutal the analysis."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-base resize-none focus:outline-none focus:border-[#dc2626]/50 focus:ring-1 focus:ring-[#dc2626]/30 transition-all"
          />
          {error && (
            <p className="text-[#dc2626] text-sm font-mono">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#dc2626] hover:bg-red-700 disabled:bg-[#dc2626]/40 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-8 rounded-xl transition-all duration-150 tracking-tight"
          >
            {loading ? 'Redirecting to payment...' : 'Take the Hit → $5'}
          </button>
          <p className="text-center text-white/30 text-sm">
            Powered by Gemini AI · Stripe secured payment · Results in ~30 seconds
          </p>
        </form>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Describe your idea', desc: 'Be specific. Include your target market, business model, and what makes it different.' },
              { step: '02', title: 'Pay $5', desc: 'Stripe checkout. One-time payment. No subscriptions, no upsells.' },
              { step: '03', title: 'Get destroyed', desc: 'AI analyzes every weakness, competitor threat, and fatal assumption in your idea.' },
            ].map((item) => (
              <div key={item.step} className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <span className="text-[#dc2626] font-mono text-sm font-bold">{item.step}</span>
                <h3 className="text-white font-bold mt-2 mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Results */}
      <section className="border-t border-white/10 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-8">Example results</h2>
          <div className="space-y-4">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="text-white/60 text-sm mb-3 italic">&quot;{ex.idea}&quot;</p>
                    <p className="text-white/50 text-sm">{ex.topHit}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-4xl font-black ${ex.score > 60 ? 'text-[#dc2626]' : ex.score > 40 ? 'text-orange-400' : 'text-green-400'}`}
                    >
                      {ex.score}
                    </div>
                    <div className="text-xs font-mono text-white/40 mt-1">KILL SCORE</div>
                    <div className={`text-xs font-bold mt-2 ${ex.score > 60 ? 'text-[#dc2626]' : 'text-green-400'}`}>
                      {ex.verdict}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <p>🎯 Killshot · Built for founders who want the truth · $5 per analysis</p>
      </footer>
    </main>
  )
}
