// Gerçek şablonları tam motor hattıyla doğrular: xslt3 CLI derleme + saxon-js çalıştırma
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const SaxonJS = require('saxon-js')

const dir = process.argv[2]
if (!dir) {
  console.log('Kullanım: node scripts/saxon-check.cjs "<şablon klasörü>"')
  process.exit(1)
}

function readSample(tsFile) {
  const src = fs.readFileSync(tsFile, 'utf8')
  return src.slice(src.indexOf('`') + 1, src.lastIndexOf('`'))
}
const FATURA = readSample('src/renderer/src/samples/faturaXml.ts')
const IRSALIYE = readSample('src/renderer/src/samples/irsaliyeXml.ts')

const xslt3js = path.join(__dirname, '..', 'node_modules', 'xslt3', 'xslt3.js')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'uni-check-'))

function compile(xsltText, hash) {
  const inP = path.join(tmp, `i${hash}.xslt`)
  const outP = path.join(tmp, `o${hash}.json`)
  fs.writeFileSync(inP, xsltText)
  execFileSync(process.execPath, [xslt3js, `-xsl:${inP}`, `-export:${outP}`, '-nogo'], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 120000
  })
  const sef = fs.readFileSync(outP, 'utf8')
  fs.unlinkSync(inP)
  fs.unlinkSync(outP)
  return sef
}

function detect(xml) {
  return /DespatchAdvice|DespatchLine/.test(xml.slice(0, 4000)) ? IRSALIYE : FATURA
}

const files = fs.readdirSync(dir).filter((f) => /\.xslt$/i.test(f))
let pass = 0
let fail = 0
for (const f of files) {
  const full = path.join(dir, f)
  const xslt = fs.readFileSync(full, 'utf8')
  const normalized = xslt.replace(/<xsl:output\s[^>]*>/gi, (tag) => {
    if (!/method\s*=\s*["']html["']/i.test(tag)) return tag
    return tag
      .replace(/\s(doctype-public|doctype-system)="[^"]*"/gi, '')
      .replace(/\sversion="[^"]*"/i, ' version="5.0"')
  })
  const xml = detect(xslt)
  const label = `${f} [${xml === IRSALIYE ? 'irsaliye' : 'fatura'} verisi]`
  try {
    const t0 = Date.now()
    const sef = compile(normalized, String(pass + fail))
    const res = SaxonJS.transform(
      { stylesheetText: sef, sourceText: xml, destination: 'serialized' },
      'sync'
    )
    const html = res.principalResult || ''
    const ms = Date.now() - t0
    if (html.length < 200) throw new Error(`çıktı çok kısa: ${html.length}`)
    console.log(`✓ ${label} — ${ms}ms, ${html.length} bayt`)
    pass++
  } catch (e) {
    const msg = String(e).replace(/\n/g, ' ').slice(0, 220)
    console.log(`✗ ${label} — ${msg}`)
    fail++
  }
}
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`\nSonuç: ${pass} başarılı, ${fail} hatalı / ${files.length} şablon`)

