#!/usr/bin/env node
// The YouTube thumbnail for the single full-course film (scripts/out/film.mp4).
//
// Not the shell's `graphl-thumb`: that template is a PER-COURSE poster (58% scene + panel), and a
// cropped 16:9 video frame turns to mush at the ~168px the mobile feed actually renders. A film
// cover needs poster grammar — few elements, enormous type, one focal object.
//
// The card is REAL: the headline stat and every day row are cut out of a spine session.txt, the
// same replayed output the scenes use, so the thumbnail cannot promise numbers the course does not
// produce. A requested row that is not in that output is a hard error.

import { mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname, isAbsolute } from 'node:path'
import { execFile } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const repoDir = process.cwd()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'].find(existsSync) ?? 'ffmpeg'

const SCALE = 2
const W = 1280 * SCALE
const H = 720 * SCALE

// ── the real output ─────────────────────────────────────────────────────────────────────────────
const SESSIONS = {
  kpis:    join(repoDir, 'spine', 'analytics', '01-kpis', 'session.txt'),
  cluster: join(repoDir, 'spine', 'production', '04-cluster', 'session.txt'),
}
const SESSION = SESSIONS.kpis

/** Cut the KPI report out of the session: its command, the headline stat, and the busiest days. */
function realKpis(wantDays) {
  const lines = readFileSync(SESSION, 'utf8').split('\n').map((l) => l.trimEnd())
  const i = lines.findIndex((l) => l.startsWith('$ '))
  if (i < 0) throw new Error(`no command in ${SESSION}`)
  const cmd = lines[i].replace(/^\$ /, '')

  // `365 days · 18014 paid orders · GMV € 2178214.10`
  const headLine = lines.find((l) => /GMV/.test(l))
  if (!headLine) throw new Error('no GMV headline in the session')
  const gmv = headLine.match(/GMV\s*€\s*([\d.]+)/)[1]
  const orders = headLine.match(/(\d+)\s+paid orders/)[1]
  const days = headLine.match(/(\d+)\s+days/)[1]

  // `  2026-11-27:  837 orders · € 98089.62`
  const rows = lines.flatMap((l) => {
    const m = l.match(/^\s+(\d{4}-\d{2}-\d{2}):\s+(\d+)\s+orders\s*·\s*€\s*([\d.]+)$/)
    return m ? [{ date: m[1], orders: +m[2], eur: m[3] }] : []
  })
  if (!rows.length) throw new Error('no day rows in the session')
  const picked = wantDays.length ? wantDays.map((d) => {
    const r = rows.find((x) => x.date === d)
    if (!r) throw new Error(`day not in the real report: ${d} (have: ${rows.map((x) => x.date).join(', ')})`)
    return r
  }) : rows
  const top = Math.max(...picked.map((r) => r.orders))
  return { cmd, days, orders, gmv, rows: picked.map((r) => ({ ...r, pct: Math.round((r.orders / top) * 100) })) }
}

/** Cut the real spark-submit run out of the session: the command, the cluster, and the tasks. */
function realCluster() {
  const lines = readFileSync(SESSIONS.cluster, 'utf8').split('\n').map((l) => l.trimEnd())
  const cmdLine = lines.find((l) => /^\$ spark-submit /.test(l))
  if (!cmdLine) throw new Error(`no spark-submit command in ${SESSIONS.cluster}`)
  const cmd = cmdLine.replace(/^\$ /, '')

  const master = (lines.find((l) => /^master:/.test(l)) ?? '').replace(/^master:\s*/, '')
  const ex = lines.find((l) => /^executors:/.test(l))
  if (!ex) throw new Error('no executors line in the cluster session')
  const executors = ex.match(/executors:\s*(\d+)/)[1]
  const cores = ex.match(/cores:\s*(\d+)/)[1]

  // `13 countries · 6 stages, 107 tasks: executor 0 ran 17, executor 1 ran 90`
  const work = lines.find((l) => /tasks:/.test(l))
  if (!work) throw new Error('no task-distribution line in the cluster session')
  const stages = work.match(/(\d+)\s+stages/)[1]
  const tasks = work.match(/(\d+)\s+tasks/)[1]
  const rows = [...work.matchAll(/executor\s+(\d+)\s+ran\s+(\d+)/g)].map((m) => ({ id: m[1], tasks: +m[2] }))
  if (!rows.length) throw new Error('no per-executor counts in the cluster session')
  const top = Math.max(...rows.map((r) => r.tasks))
  return { cmd, master, executors, cores, stages, tasks,
           rows: rows.map((r) => ({ ...r, pct: Math.round((r.tasks / top) * 100) })) }
}

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const money = (s) => group(String(s).split('.')[0])

// ── the page ────────────────────────────────────────────────────────────────────────────────────
const fontFace = (fam, weight, file) => {
  const b64 = readFileSync(join(repoDir, 'node_modules', '@fontsource', fam, 'files', file)).toString('base64')
  return `@font-face{font-family:'${fam === 'ibm-plex-mono' ? 'IBM Plex Mono' : 'IBM Plex Sans'}';`
    + `font-weight:${weight};font-style:normal;font-display:block;`
    + `src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}

const THEMES = {
  dark:  { badgeInk: '#14100e', bg: '#14100e', card: '#1e1813', ink: '#ffffff', accent: '#ff8a3d',
           rule: 'rgba(255,255,255,.13)', glow: 'radial-gradient(125% 115% at 10% 8%, #3a1f0f 0%, #14100e 62%)' },
  ember: { badgeInk: '#14100e', bg: '#140d0a', card: '#241812', ink: '#ffffff', accent: '#ffb24d',
           rule: 'rgba(255,255,255,.12)', glow: 'radial-gradient(130% 110% at 86% 14%, #6b2a0c 0%, #140d0a 60%)' },
  light: { badgeInk: '#ffffff', bg: '#f6f4f1', card: '#1b1512', ink: '#17110d', accent: '#d24e12',
           rule: 'rgba(0,0,0,.12)', glow: 'radial-gradient(120% 120% at 10% 8%, #ffffff 0%, #ece6df 70%)' },
}

function logoSvg() {
  return readFileSync(join(repoDir, 'public', 'favicon.svg'), 'utf8').replace('<svg ', '<svg class="logo" ')
}

function pageHtml({ kpi, cluster, theme, head1, head2, badge }) {
  const t = THEMES[theme]
  const nRows = (cluster ?? kpi).rows.length
  const fonts = [
    fontFace('ibm-plex-sans', 700, 'ibm-plex-sans-latin-700-normal.woff2'),
    fontFace('ibm-plex-sans', 600, 'ibm-plex-sans-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 600, 'ibm-plex-mono-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 400, 'ibm-plex-mono-latin-400-normal.woff2'),
  ].join('')

  // One grid for the table, so every column lines up and nothing can collide.
  const cells = cluster ? cluster.rows.map((r) => {
    const hot = r.tasks === Math.max(...cluster.rows.map((x) => x.tasks))
    return `<span class="day${hot ? ' hot' : ''}">executor ${esc(r.id)}</span>`
      + `<span class="ord"></span>`
      + `<span class="bar"><i style="width:${r.pct}%;background:${hot ? t.accent : '#5aa9e6'}"></i></span>`
      + `<span class="eur"${hot ? ` style="color:${t.accent}"` : ''}>${r.tasks} tasks</span>`
  }).join('') : kpi.rows.map((r, i) => {
    const hot = i === 0
    const barCol = hot ? t.accent : '#5aa9e6'
    return `<span class="day${hot ? ' hot' : ''}">${esc(r.date)}</span>`
      + `<span class="ord">${group(r.orders)}</span>`
      + `<span class="bar"><i style="width:${r.pct}%;background:${barCol}"></i></span>`
      + `<span class="eur"${hot ? ` style="color:${t.accent}"` : ''}>€${esc(money(r.eur))}</span>`
  }).join('')

  return `<style>
  ${fonts}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${t.bg};background-image:${t.glow};
       font-family:'IBM Plex Sans',system-ui,sans-serif;color:${t.ink};
       display:flex;align-items:stretch;gap:${40 * SCALE}px;padding:${46 * SCALE}px ${50 * SCALE}px}

  .left{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center}
  .logo{width:${92 * SCALE}px;height:${92 * SCALE}px;display:block;margin-bottom:${18 * SCALE}px;
        border-radius:${20 * SCALE}px}
  .h{font-weight:700;line-height:.85;letter-spacing:-.05em;font-size:${116 * SCALE}px}
  .h2{color:${t.accent}}
  .badge{align-self:flex-start;margin-top:${26 * SCALE}px;padding:${11 * SCALE}px ${24 * SCALE}px;
         background:${t.accent};border-radius:${12 * SCALE}px;
         font-weight:700;font-size:${34 * SCALE}px;letter-spacing:.06em;color:${t.badgeInk}}

  .card{flex:1;min-width:0;background:${t.card};border:${1 * SCALE}px solid ${t.rule};
        border-radius:${18 * SCALE}px;padding:${26 * SCALE}px ${30 * SCALE}px ${24 * SCALE}px;
        display:flex;flex-direction:column;box-shadow:0 ${22 * SCALE}px ${64 * SCALE}px rgba(0,0,0,.5)}
  .dots{display:flex;gap:${9 * SCALE}px;margin-bottom:${16 * SCALE}px}
  .dots i{width:${13 * SCALE}px;height:${13 * SCALE}px;border-radius:50%}
  .cmd{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;color:rgba(255,255,255,.62);
       margin-bottom:${16 * SCALE}px;white-space:nowrap}
  .cmd b{color:#6ee787;font-weight:400}

  .stat{font-family:'IBM Plex Mono',monospace;font-weight:600;color:#fff;
        font-size:${40 * SCALE}px;letter-spacing:-.02em;white-space:nowrap}
  .stat em{font-style:normal;color:${t.accent}}
  .statsub{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;
           color:rgba(255,255,255,.55);margin-top:${6 * SCALE}px;white-space:nowrap}

  .rows{flex:1;display:grid;align-content:center;grid-template-columns:auto auto 1fr auto;
        column-gap:${14 * SCALE}px;row-gap:${(nRows <= 2 ? 34 : 20) * SCALE}px;
        font-family:'IBM Plex Mono',monospace;font-weight:600;
        font-size:${(nRows <= 2 ? 40 : 31) * SCALE}px;color:#fff}
  .day{letter-spacing:-.02em;color:rgba(255,255,255,.88)}
  .day.hot{color:${t.accent}}
  .ord{color:rgba(255,255,255,.78);text-align:right}
  .bar{height:${20 * SCALE}px;min-width:${110 * SCALE}px;border-radius:${10 * SCALE}px;
       background:rgba(255,255,255,.1);overflow:hidden;align-self:center}
  .bar i{display:block;height:100%;border-radius:${10 * SCALE}px}
  .eur{text-align:right;white-space:nowrap;color:rgba(255,255,255,.9)}
  .foot{font-family:'IBM Plex Mono',monospace;font-size:${23 * SCALE}px;
        color:rgba(255,255,255,.4);letter-spacing:.04em}
</style>
<div class="left">
  ${logoSvg()}
  <div class="h">${esc(head1)}</div>
  <div class="h h2">${esc(head2)}</div>
  <div class="badge">${esc(badge)}</div>
</div>
<div class="card">
  <div class="dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
  <div class="cmd">$ <b>${esc(cluster ? cluster.cmd : kpi.cmd)}</b></div>
  ${cluster
    ? `<div class="stat"><em>${esc(cluster.tasks)}</em> tasks · <em>${esc(cluster.stages)}</em> stages</div>
       <div class="statsub">${esc(cluster.executors)} executors · ${esc(cluster.cores)} cores · ${esc(cluster.master)}</div>`
    : `<div class="stat">GMV <em>€${esc(money(kpi.gmv))}</em></div>
       <div class="statsub">${esc(group(kpi.orders))} paid orders · ${esc(kpi.days)} days</div>`}
  <div class="rows">${cells}</div>
  <div class="foot">${cluster ? 'a real cluster · work split across executors' : 'busiest days · orders and revenue'}</div>
</div>`
}

// ── render ──────────────────────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2)
  const opt = { theme: 'dark', out: 'output/thumbnails/film.png', source: 'cluster',
                head1: 'LEARN', head2: 'SPARK', badge: 'FULL COURSE', days: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--theme') opt.theme = argv[++i]
    else if (a === '--out') opt.out = argv[++i]
    else if (a === '--head1') opt.head1 = argv[++i]
    else if (a === '--head2') opt.head2 = argv[++i]
    else if (a === '--badge') opt.badge = argv[++i]
    else if (a === '--days') opt.days = argv[++i].split(',')
    else if (a === '--source') opt.source = argv[++i]
    else { console.error(`unknown argument: ${a}`); process.exit(2) }
  }
  if (!THEMES[opt.theme]) { console.error(`unknown theme: ${opt.theme} (have: ${Object.keys(THEMES).join(', ')})`); process.exit(2) }

  if (!['kpis', 'cluster'].includes(opt.source)) {
    console.error(`unknown source: ${opt.source} (have: kpis, cluster)`); process.exit(2)
  }
  const cluster = opt.source === 'cluster' ? realCluster() : null
  const kpi = opt.source === 'kpis' ? realKpis(opt.days) : null
  if (cluster) {
    console.log(`Real spark-submit from spine: $ ${cluster.cmd}`)
    console.log(`  ${cluster.master} · ${cluster.executors} executors · ${cluster.cores} cores`)
    console.log(`  ${cluster.stages} stages, ${cluster.tasks} tasks`)
    for (const r of cluster.rows) console.log(`  executor ${r.id}: ${r.tasks} tasks (${r.pct}%)`)
  } else {
    console.log(`Real KPIs from spine: $ ${kpi.cmd}`)
    console.log(`  ${kpi.days} days · ${kpi.orders} paid orders · GMV €${kpi.gmv}`)
    for (const r of kpi.rows) console.log(`  ${r.date}  ${String(r.orders).padStart(4)} orders  €${r.eur}  (${r.pct}%)`)
  }

  const requireFromRepo = createRequire(join(repoDir, 'package.json'))
  const { default: puppeteer } = await import(pathToFileURL(requireFromRepo.resolve('puppeteer')).href)

  const browser = await puppeteer.launch({ headless: true,
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }, args: [`--window-size=${W},${H}`] })
  try {
    const page = await browser.newPage()
    await page.setContent(pageHtml({ kpi, cluster, ...opt }), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    // The real command must appear in full — never truncated — so fit it by shrinking, not cutting.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.cmd,.stat,.statsub,.foot')) {
        const room = el.clientWidth - 1        // the element's OWN content box
        if (el.scrollWidth <= room) continue   // already fits — leave it alone
        const px = parseFloat(getComputedStyle(el).fontSize)
        // one bounded step, never a loop: a loop can chase a width that moves with the font
        el.style.fontSize = `${Math.max(10, Math.floor(px * (room / el.scrollWidth) * 0.98))}px`
      }
    })
    await sleep(250)

    // A thumbnail that silently clips its own text is worse than one that fails loudly.
    const overflow = await page.evaluate(() => {
      const bad = []
      for (const sel of ['.rows', '.card', '.left', 'body']) {
        const el = document.querySelector(sel)
        if (el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
          bad.push(`${sel} ${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight}`)
        }
      }
      for (const el of document.querySelectorAll('.day,.ord,.eur,.cmd,.h,.badge,.stat,.statsub')) {
        const r = el.getBoundingClientRect()
        if (r.right > window.innerWidth + 1 || r.bottom > window.innerHeight + 1) {
          bad.push(`clipped: "${el.textContent.trim().slice(0, 20)}" right=${Math.round(r.right)}`)
        }
      }
      return bad
    })
    if (overflow.length) throw new Error(`layout overflows:\n  ${overflow.join('\n  ')}`)

    const out = isAbsolute(opt.out) ? opt.out : join(repoDir, opt.out)
    mkdirSync(dirname(out), { recursive: true })
    const big = join(tmpdir(), `thumb-film-${Date.now()}.png`)
    await page.screenshot({ path: big })
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', out])
    rmSync(big, { force: true })
    console.log(`\n✅ ${out}  (${opt.theme})`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => { console.error('\n✗', e.message); process.exit(1) })
