import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM = `You are an expert career coach who asks incisive, empathetic questions.
Your job is to generate 7 personalised career reflection questions based on a professional's CV.
The questions should uncover: motivations, peak experiences, frustrations, career aspirations, strengths, and next steps.
Do NOT ask generic questions. Each question must reference specific details from their CV (job titles, companies, domains, timeline).
Return JSON with a "questions" array of exactly 7 strings.`

export async function POST(req: NextRequest) {
  try {
    const { cvText } = await req.json()
    if (!cvText) return NextResponse.json({ error: 'No CV text provided' }, { status: 400 })

    const prompt = `Here is the professional's CV:\n\n${cvText}\n\nGenerate 7 personalised career reflection questions.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.75,
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid questions format from LLM')
    }

    return NextResponse.json({ questions: parsed.questions.slice(0, 7) })
  } catch (e: unknown) {
    console.error('generate-questions error:', e)
    return NextResponse.json({ error: 'Failed to generate questions. Check your GROQ_API_KEY.' }, { status: 500 })
  }
}
