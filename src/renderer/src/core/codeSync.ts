/**
 * Kod-satırı eşitleme: seçili önizleme öğesinin XSLT kaynağındaki satırını bulur.
 * Enjeksiyon sırasında üretilen meta imzası (etiket adı + aynı etiket içinde sıra)
 * orijinal kaynakta regex ile aranır.
 */
import type { XsltIdMeta } from './xsltId'

export interface SourceLocation {
  line: number
  column: number
}

export function findLineByMeta(source: string, meta: XsltIdMeta): SourceLocation | null {
  const tagPattern = new RegExp(`<\\/?${escapeRegExp(meta.tag)}(?=[\\s>/])`, 'g')
  let seen = -1
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(source)) !== null) {
    // kapanış etiketlerini atla
    if (source[match.index + 1] === '/') continue
    seen += 1
    if (seen === meta.ordinal) {
      const before = source.slice(0, match.index)
      const line = before.split('\n').length
      const lastNewline = before.lastIndexOf('\n')
      const column = match.index - (lastNewline + 1) + 1
      return { line, column }
    }
  }
  return null
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
