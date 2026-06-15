import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

const NAVY = 'FF1F4E79'
const NAVY_MID = 'FF2E75B6'
const NAVY_LIGHT = 'FFDEEAF1'
const NAVY_XL = 'FFEBF3FB'
const GREEN_H = 'FFE2EFDA'
const GREEN_D = 'FF375623'
const AMBER_H = 'FFFFF2CC'
const AMBER_D = 'FF7F6000'
const RED_H = 'FFFCE4D6'
const RED_D = 'FF843C0C'
const GRAY_H = 'FFF2F2F2'
const WHITE = 'FFFFFFFF'

type CellStyle = {
  bg?: string
  bold?: boolean
  italic?: boolean
  color?: string
  size?: number
  wrap?: boolean
  hAlign?: ExcelJS.Alignment['horizontal']
  vAlign?: ExcelJS.Alignment['vertical']
  border?: boolean
}

function styleCell(cell: ExcelJS.Cell, opts: CellStyle = {}) {
  const { bg = WHITE, bold = false, italic = false, color = 'FF000000', size = 10, wrap = true, hAlign = 'left', vAlign = 'top', border = true } = opts
  cell.font = { name: 'Arial', bold, italic, size, color: { argb: color } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
  cell.alignment = { horizontal: hAlign, vertical: vAlign, wrapText: wrap }
  if (border) {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    }
  }
}

function headerRow(ws: ExcelJS.Worksheet, row: number, values: string[], bg = NAVY, height = 26) {
  ws.getRow(row).height = height
  values.forEach((v, i) => {
    const cell = ws.getCell(row, i + 1)
    cell.value = v
    styleCell(cell, { bg, bold: true, color: 'FFFFFFFF', size: 10, hAlign: 'center', vAlign: 'middle' })
  })
}

function sectionTitle(ws: ExcelJS.Worksheet, row: number, text: string, cols: number, bg = NAVY_MID) {
  ws.mergeCells(row, 1, row, cols)
  const cell = ws.getCell(row, 1)
  cell.value = text
  styleCell(cell, { bg, bold: true, color: 'FFFFFFFF', size: 11, hAlign: 'left', vAlign: 'middle' })
  ws.getRow(row).height = 22
}

function titleBanner(ws: ExcelJS.Worksheet, text: string, cols: number) {
  ws.mergeCells(1, 1, 1, cols)
  const cell = ws.getCell(1, 1)
  cell.value = text
  styleCell(cell, { bg: NAVY, bold: true, color: 'FFFFFFFF', size: 14, hAlign: 'center', vAlign: 'middle' })
  ws.getRow(1).height = 36
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: NextRequest) {
  try {
    const { synthesis } = await req.json()
    if (!synthesis) return NextResponse.json({ error: 'No synthesis data' }, { status: 400 })

    const wb = new ExcelJS.Workbook()
    wb.creator = 'CareerCare AI'
    wb.created = new Date()

    // ── Sheet 1: Career Snapshot ──────────────────────────────────
    const ws1 = wb.addWorksheet('Career Snapshot', { properties: { tabColor: { argb: '1F4E79' } } })
    ws1.views = [{ showGridLines: false }]
    titleBanner(ws1, 'CAREER SNAPSHOT — CareerCare AI', 4)

    ws1.mergeCells(2, 1, 2, 4)
    const sub = ws1.getCell(2, 1)
    sub.value = synthesis.name + '  ·  Generated ' + new Date().toLocaleDateString('en-GB')
    styleCell(sub, { bg: NAVY, italic: true, color: 'FFBFBFBF', size: 9, hAlign: 'center' })
    ws1.getRow(2).height = 16

    sectionTitle(ws1, 4, 'CURRENT STATE', 4)
    const cs = synthesis.current_state
    const currentRows = [
      ['Current Role', cs.role],
      ['Company', cs.company],
      ['Total Experience', cs.experience],
      ['Domain / Vertical', cs.domain],
      ['Current CTC', cs.ctc_approx],
      ['Notice Period', cs.notice_period],
    ]
    currentRows.forEach(([label, val], i) => {
      ws1.getRow(5 + i).height = 20
      const lc = ws1.getCell(5 + i, 1)
      lc.value = label
      styleCell(lc, { bg: NAVY_LIGHT, bold: true })
      ws1.mergeCells(5 + i, 2, 5 + i, 4)
      const vc = ws1.getCell(5 + i, 2)
      vc.value = val
      styleCell(vc, { bg: i % 2 === 0 ? NAVY_XL : WHITE })
    })

    sectionTitle(ws1, 12, 'TARGET STATE', 4, 'FF375623')
    const ts = synthesis.target_state
    const targetRows = [
      ['Target Roles', Array.isArray(ts.roles) ? ts.roles.join(' · ') : ts.roles],
      ['Target Sectors', Array.isArray(ts.sectors) ? ts.sectors.join(', ') : ts.sectors],
      ['Location', ts.location],
      ['Salary — Minimum', ts.salary_min],
      ['Salary — Realistic', ts.salary_max],
      ['Salary — Aspirational', ts.salary_aspirational],
      ['Timeline', ts.timeline],
    ]
    targetRows.forEach(([label, val], i) => {
      ws1.getRow(13 + i).height = 20
      const lc = ws1.getCell(13 + i, 1)
      lc.value = label
      styleCell(lc, { bg: GREEN_H, bold: true })
      ws1.mergeCells(13 + i, 2, 13 + i, 4)
      const vc = ws1.getCell(13 + i, 2)
      vc.value = val
      styleCell(vc, { bg: i % 2 === 0 ? GREEN_H : WHITE })
    })

    sectionTitle(ws1, 21, 'POSITIONING STATEMENT', 4, NAVY_MID)
    ws1.mergeCells(22, 1, 24, 4)
    const ps = ws1.getCell(22, 1)
    ps.value = synthesis.positioning_statement
    styleCell(ps, { bg: NAVY_XL, italic: true, color: 'FF1F4E79' })
    ws1.getRow(22).height = 20; ws1.getRow(23).height = 20; ws1.getRow(24).height = 20

    ws1.getColumn(1).width = 22
    ws1.getColumn(2).width = 28
    ws1.getColumn(3).width = 20
    ws1.getColumn(4).width = 20

    // ── Sheet 2: Strengths & Gaps ─────────────────────────────────
    const ws2 = wb.addWorksheet('Strengths & Gaps', { properties: { tabColor: { argb: '375623' } } })
    ws2.views = [{ showGridLines: false }]
    titleBanner(ws2, 'STRENGTHS & GAPS — CareerCare AI', 4)

    sectionTitle(ws2, 3, '✅  TOP STRENGTHS', 4, 'FF375623')
    headerRow(ws2, 4, ['Strength', 'Evidence', 'Interview Story / Example', 'Relevance to Target Roles'], 'FF375623')

    const strengths = synthesis.top_strengths || []
    strengths.forEach((s: { strength: string; evidence: string; interview_story: string; relevance: string }, i: number) => {
      const r = 5 + i
      ws2.getRow(r).height = 60
      const bg = i % 2 === 0 ? GREEN_H : WHITE
      const sc = ws2.getCell(r, 1); sc.value = s.strength; styleCell(sc, { bg: GREEN_H, bold: true })
      const ec = ws2.getCell(r, 2); ec.value = s.evidence; styleCell(ec, { bg })
      const ic = ws2.getCell(r, 3); ic.value = s.interview_story; styleCell(ic, { bg })
      const rc = ws2.getCell(r, 4); rc.value = s.relevance; styleCell(rc, { bg })
    })

    const g3start = 5 + strengths.length + 2
    sectionTitle(ws2, g3start, '⚠️  KEY GAPS', 4, 'FFC55A11')
    headerRow(ws2, g3start + 1, ['Gap', 'Why It Matters', 'Action to Close It', 'Timeline'], 'FFC55A11')

    const gaps = synthesis.key_gaps || []
    gaps.forEach((g: { gap: string; impact: string; action: string; timeline: string }, i: number) => {
      const r = g3start + 2 + i
      ws2.getRow(r).height = 60
      const bg = i < 2 ? RED_H : AMBER_H
      const gc = ws2.getCell(r, 1); gc.value = g.gap; styleCell(gc, { bg, bold: true })
      const ic = ws2.getCell(r, 2); ic.value = g.impact; styleCell(ic, { bg })
      const ac = ws2.getCell(r, 3); ac.value = g.action; styleCell(ac, { bg })
      const tc = ws2.getCell(r, 4); tc.value = g.timeline; styleCell(tc, { bg, hAlign: 'center' })
    })

    ws2.getColumn(1).width = 24
    ws2.getColumn(2).width = 30
    ws2.getColumn(3).width = 36
    ws2.getColumn(4).width = 16
    ws2.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }]

    // ── Sheet 3: Career Journey ───────────────────────────────────
    const ws3 = wb.addWorksheet('Career Journey', { properties: { tabColor: { argb: '2E75B6' } } })
    ws3.views = [{ showGridLines: false }]
    titleBanner(ws3, 'CAREER JOURNEY — CareerCare AI', 6)

    // Build timeline from CV text (simplified - use available synthesis data)
    headerRow(ws3, 3, ['Period', 'Company / Role', 'Key Achievement', 'Key Learning', 'Strength Revealed', 'Next Step Taken'], NAVY)
    ws3.getRow(3).height = 28

    // If synthesis has timeline data use it, otherwise show placeholder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (synthesis as any).career_timeline || [
      {
        period: 'See CV',
        company: synthesis.current_state.company,
        role: synthesis.current_state.role,
        key_achievement: 'See Strengths & Gaps sheet for highlights',
        key_learning: 'Detailed journey derived from your CV',
        highlight: synthesis.positioning_statement,
      },
    ]

    timeline.forEach((t: { period?: string; company?: string; role?: string; key_achievement?: string; key_learning?: string; highlight?: string }, i: number) => {
      const r = 4 + i
      ws3.getRow(r).height = 70
      const bg = i % 2 === 0 ? NAVY_XL : WHITE
      const cells = [
        t.period || '',
        `${t.company || ''}\n${t.role || ''}`,
        t.key_achievement || '',
        t.key_learning || '',
        '',
        t.highlight || '',
      ]
      cells.forEach((val, j) => {
        const c = ws3.getCell(r, j + 1)
        c.value = val
        styleCell(c, { bg: j === 0 ? NAVY_LIGHT : bg, bold: j === 0 })
      })
    })

    ;[18, 26, 34, 22, 22, 28].forEach((w, i) => { ws3.getColumn(i + 1).width = w })
    ws3.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }]

    // ── Sheet 4: Action Plan ──────────────────────────────────────
    const ws4 = wb.addWorksheet('Action Plan (90 Days)', { properties: { tabColor: { argb: 'C55A11' } } })
    ws4.views = [{ showGridLines: false }]
    titleBanner(ws4, '90-DAY ACTION PLAN — CareerCare AI', 6)

    headerRow(ws4, 2, ['Phase', 'Action', 'Category', 'Priority', 'Target Date', 'Status'], NAVY)
    ws4.getRow(2).height = 26

    const phaseColors: Record<string, string> = {
      'Days 1–15 (Foundation)': NAVY_LIGHT,
      'Days 16–30 (Network + Prep)': 'FFEAE0F0',
      'Days 31–45 (Active Search)': AMBER_H,
      'Days 46–90 (Offers)': GREEN_H,
    }
    const priBgs: Record<string, string> = { Critical: RED_H, High: AMBER_H, Medium: GRAY_H }

    const plan = synthesis.action_plan || []
    plan.forEach((item: { phase: string; action: string; category: string; priority: string; target_date: string }, i: number) => {
      const r = 3 + i
      ws4.getRow(r).height = 40
      const phaseBg = phaseColors[item.phase] || NAVY_XL
      const priBg = priBgs[item.priority] || GRAY_H

      const ph = ws4.getCell(r, 1); ph.value = item.phase; styleCell(ph, { bg: phaseBg, bold: true })
      const ac = ws4.getCell(r, 2); ac.value = item.action; styleCell(ac, { bg: i % 2 === 0 ? 'FFF9FAFB' : WHITE })
      const ca = ws4.getCell(r, 3); ca.value = item.category; styleCell(ca, { bg: GRAY_H })
      const pr = ws4.getCell(r, 4); pr.value = item.priority; styleCell(pr, { bg: priBg, hAlign: 'center' })
      const dt = ws4.getCell(r, 5); dt.value = item.target_date; styleCell(dt, { bg: WHITE, hAlign: 'center' })
      const st = ws4.getCell(r, 6); st.value = 'Not Started'; styleCell(st, { bg: GRAY_H, hAlign: 'center' })
    })

    ;[18, 38, 18, 12, 14, 14].forEach((w, i) => { ws4.getColumn(i + 1).width = w })
    ws4.views = [{ state: 'frozen', ySplit: 2, showGridLines: false }]

    // ── Render ────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer()

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="CareerCare_${(synthesis.name || 'Report').replace(/\s+/g, '_')}.xlsx"`,
      },
    })
  } catch (e: unknown) {
    console.error('generate-excel error:', e)
    return NextResponse.json({ error: 'Excel generation failed.' }, { status: 500 })
  }
}
