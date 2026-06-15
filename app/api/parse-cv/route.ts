import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.name.toLowerCase().endsWith('.pdf')) {
      // Dynamic import to avoid Next.js static analysis issues with pdf-parse
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
      const data = await pdfParse(buffer)
      text = data.text
    } else if (file.name.toLowerCase().match(/\.docx?$/)) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 400 })
    }

    if (!text || text.trim().length < 100) {
      return NextResponse.json({ error: 'Could not extract text from this file. Is it a scanned image PDF?' }, { status: 400 })
    }

    // Truncate to ~6000 chars to stay within Groq context limits
    const truncated = text.trim().slice(0, 6000)

    return NextResponse.json({ text: truncated, length: truncated.length })
  } catch (e: unknown) {
    console.error('parse-cv error:', e)
    return NextResponse.json({ error: 'Failed to parse file. Please try a different format.' }, { status: 500 })
  }
}

export const config = { api: { bodyParser: false } }
