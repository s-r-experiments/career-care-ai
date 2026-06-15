import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM = `You are a world-class career strategist. Analyse a professional's CV and their answers to reflection questions.
Generate a deeply personalised career analysis as structured JSON.
Be specific — reference actual companies, projects, skills, and time periods from their background.
Return ONLY valid JSON matching the exact schema below. No markdown, no extra text.`

const SCHEMA = `{
  "name": "string",
  "positioning_statement": "2-3 sentence positioning statement for job applications, written in first person",
  "current_state": {
    "role": "string",
    "company": "string",
    "experience": "string e.g. '8+ years'",
    "domain": "string e.g. 'Pharma Commercial Analytics, Insurance'",
    "ctc_approx": "string or 'Not mentioned'",
    "notice_period": "string or 'Standard (30–90 days)'"
  },
  "target_state": {
    "roles": ["array of 3-4 specific target job titles"],
    "sectors": ["array of 2-3 target sectors"],
    "location": "string",
    "salary_min": "string e.g. '₹55 LPA'",
    "salary_max": "string e.g. '₹80 LPA'",
    "salary_aspirational": "string e.g. '₹100 LPA'",
    "timeline": "string e.g. 'Immediate – active search'"
  },
  "top_strengths": [
    {
      "strength": "concise name",
      "evidence": "specific evidence from CV or answers",
      "interview_story": "how to tell this in a job interview (1-2 sentences)",
      "relevance": "why this matters for their target roles"
    }
  ],
  "key_gaps": [
    {
      "gap": "concise gap name",
      "impact": "why this matters for their career goals",
      "action": "specific action to close this gap",
      "timeline": "e.g. '0–30 days' or 'Ongoing'"
    }
  ],
  "action_plan": [
    {
      "phase": "one of: 'Days 1–15 (Foundation)' | 'Days 16–30 (Network + Prep)' | 'Days 31–45 (Active Search)' | 'Days 46–90 (Offers)'",
      "action": "specific actionable task",
      "category": "one of: CV & Materials | Personal Brand | Networking | Interview Prep | Applications | Strategy | Negotiation",
      "priority": "one of: Critical | High | Medium",
      "target_date": "specific date string",
      "notes": "brief helpful context"
    }
  ]
}`

export async function POST(req: NextRequest) {
  try {
    const { cvText, questions, answers } = await req.json()
    if (!cvText || !answers?.length) {
      return NextResponse.json({ error: 'Missing CV text or answers' }, { status: 400 })
    }

    const qa = questions.map((q: string, i: number) => `Q${i + 1}: ${q}\nA: ${answers[i] || '(no answer)'}`).join('\n\n')

    const prompt = `
CV TEXT:
${cvText}

CAREER REFLECTION ANSWERS:
${qa}

Generate a comprehensive career analysis following this exact JSON schema:
${SCHEMA}

Rules:
- Generate exactly 5 top_strengths
- Generate exactly 4 key_gaps
- Generate exactly 16 action_plan items (4 per phase)
- Base salary targets on the person's actual experience level and stated goals
- All dates in action_plan should be realistic based on today being ${new Date().toDateString()}
- Be specific and personalised — reference their actual background`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 4096,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'

    let synthesis
    try {
      synthesis = JSON.parse(raw)
    } catch {
      throw new Error('LLM returned invalid JSON')
    }

    // Validate required fields
    if (!synthesis.positioning_statement || !synthesis.top_strengths || !synthesis.action_plan) {
      throw new Error('Incomplete synthesis from LLM')
    }

    return NextResponse.json({ synthesis })
  } catch (e: unknown) {
    console.error('synthesise error:', e)
    return NextResponse.json({ error: 'Synthesis failed. Please try again.' }, { status: 500 })
  }
}
