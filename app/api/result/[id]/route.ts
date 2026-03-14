import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const filePath = path.join(STORAGE_DIR, `${id}.json`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 })
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  // Generate on-demand if payment completed but analysis missing
  if (data.status === 'pending' || data.status === 'processing') {
    // Check if paid=true in URL (fallback for webhook delay)
    const url = new URL(req.url)
    if (url.searchParams.get('paid') === 'true' && data.status === 'pending') {
      try {
        data.status = 'processing'
        fs.writeFileSync(filePath, JSON.stringify(data))
        const analysis = await generateAnalysis(data.idea)
        data.status = 'complete'
        data.analysis = analysis
        data.completedAt = new Date().toISOString()
        fs.writeFileSync(filePath, JSON.stringify(data))
      } catch (err) {
        console.error('On-demand analysis error:', err)
        return NextResponse.json({ status: 'error', error: 'Analysis failed' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ status: data.status })
    }
  }

  if (data.status === 'complete') {
    return NextResponse.json({ status: 'complete', analysis: data.analysis, idea: data.idea })
  }

  return NextResponse.json({ status: data.status })
}
