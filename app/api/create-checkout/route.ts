/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

const STORAGE_DIR = '/tmp/killshots'

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json()

    if (!idea || typeof idea !== 'string' || idea.trim().length < 20) {
      return NextResponse.json({ error: 'Idea must be at least 20 characters' }, { status: 400 })
    }

    const sessionId = uuidv4()

    // Store idea
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true })
    }
    fs.writeFileSync(
      path.join(STORAGE_DIR, `${sessionId}.json`),
      JSON.stringify({ idea: idea.trim(), status: 'pending', createdAt: new Date().toISOString() })
    )

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Killshot Analysis',
              description: 'Brutal AI startup idea analysis — Kill Score, vulnerabilities, and more',
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/result/${sessionId}?paid=true`,
      cancel_url: `${baseUrl}/?cancelled=true`,
      metadata: {
        sessionId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
