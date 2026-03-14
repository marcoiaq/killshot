/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

const STORAGE_DIR = '/tmp/killshots'

async function generateAnalysis(idea: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Analyze this startup idea and try to kill it: ${idea}

Return ONLY valid JSON (no markdown, no explanation, just JSON):
{
  "kill_score": <number 0-100, higher means more dead>,
  "verdict": <"DEAD ON ARRIVAL" if kill_score > 60, else "SURVIVED">,
  "hit_list": [{"title": <string>, "detail": <string>}],
  "competitors": [{"name": <string>, "reason": <string>}],
  "fatal_assumptions": [{"assumption": <string>, "reality": <string>}],
  "survival_guide": [<string>, <string>, <string>],
  "cause_of_death": <string or null>
}

Rules:
- hit_list must have 4-5 items
- competitors must have exactly 3 items
- fatal_assumptions must have 2-3 items
- survival_guide: include 3 strings only if kill_score > 40, otherwise empty array
- cause_of_death: 2-3 brutal sentences only if kill_score <= 40, otherwise null
- Be specific, cite real companies, be harsh, do not hedge`

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: 'You are a brutal startup critic. Your job is to find every weakness in a startup idea and expose it. Be specific, be harsh, cite real examples. Do not be encouraging. Do not hedge. Find the kill shot.',
  })

  const text = result.response.text()
  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (sig && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_placeholder') {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } else {
      // For development/testing without webhook secret
      event = JSON.parse(body)
    }
  } catch (err: unknown) {
    const error = err as Error
    console.error('Webhook signature error:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const sessionId = session.metadata?.sessionId

    if (sessionId) {
      const filePath = path.join(STORAGE_DIR, `${sessionId}.json`)
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (data.status === 'pending') {
          try {
            data.status = 'processing'
            fs.writeFileSync(filePath, JSON.stringify(data))

            const analysis = await generateAnalysis(data.idea)
            data.status = 'complete'
            data.analysis = analysis
            data.completedAt = new Date().toISOString()
            fs.writeFileSync(filePath, JSON.stringify(data))
          } catch (err) {
            console.error('Analysis error:', err)
            data.status = 'error'
            fs.writeFileSync(filePath, JSON.stringify(data))
          }
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
