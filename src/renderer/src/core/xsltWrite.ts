/**
 * XSLT kaynak koduna kimlik bazlı geri yazma işlemleri.
 *
 * Akış: mevcut XSLT metni → deterministik data-xslt-id enjeksiyonu →
 * DOM mutasyonu → kimlikler temizlenmiş yeni metin.
 */
import { injectXsltIds, stripXsltIds, XSLT_ID_ATTR } from './xsltId'
import { XSLT_NS } from './xsltId'

function withDoc(xsltSrc: string, fn: (doc: Document) => void): string {
  const inj = injectXsltIds(xsltSrc)
  if (!inj) return xsltSrc
  fn(inj.doc)
  return stripXsltIds(new XMLSerializer().serializeToString(inj.doc))
}

export function findById(doc: Document | Element, id: string): Element | null {
  return doc.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`)
}

export function parseStyleAttr(style: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!style) return out
  for (const decl of style.split(';')) {
    const idx = decl.indexOf(':')
    if (idx === -1) continue
    const key = decl.slice(0, idx).trim().toLowerCase()
    const value = decl.slice(idx + 1).trim()
    if (key && value) out[key] = value
  }
  return out
}

export function stringifyStyle(map: Record<string, string>): string {
  return Object.entries(map)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

/** Seçili düğümün style özniteliğine yamayı uygular ('' değer siler). */
export function setStyleInXslt(
  xsltSrc: string,
  id: string,
  patch: Record<string, string>
): string {
  return withDoc(xsltSrc, (doc) => {
    const el = findById(doc, id)
    if (!el) return
    const merged = parseStyleAttr(el.getAttribute('style'))
    for (const [k, v] of Object.entries(patch)) {
      if (v === '') delete merged[k.toLowerCase()]
      else merged[k.toLowerCase()] = v
    }
    if (Object.keys(merged).length === 0) el.removeAttribute('style')
    else el.setAttribute('style', stringifyStyle(merged))
  })
}

/** Düğümün statik metin içeriğini okur (xsl:* alt öğesi varsa null — dinamik alan). */
export function readStaticText(doc: Document, id: string): string | null {
  const el = findById(doc, id)
  if (!el) return null
  const hasDynamic = Array.from(el.children).some((c) => c.namespaceURI === XSLT_NS)
  if (hasDynamic) return null
  return (el.textContent ?? '').trim()
}

/** Statik metin güncelleme; dinamik alanlarda işlem yapmaz. */
export function setTextInXslt(xsltSrc: string, id: string, text: string): string {
  const inj = injectXsltIds(xsltSrc)
  if (!inj) return xsltSrc
  const el = findById(inj.doc, id)
  if (!el) return xsltSrc
  const hasDynamic = Array.from(el.children).some((c) => c.namespaceURI === XSLT_NS)
  if (hasDynamic) return xsltSrc

  return withDoc(xsltSrc, (doc) => {
    const target = findById(doc, id)
    if (!target) return
    target.textContent = text
  })
}

export function deleteXsltNode(xsltSrc: string, id: string): string {
  return withDoc(xsltSrc, (doc) => {
    findById(doc, id)?.remove()
  })
}

export function duplicateXsltNode(xsltSrc: string, id: string): string {
  return withDoc(xsltSrc, (doc) => {
    const el = findById(doc, id)
    if (!el?.parentNode) return
    const clone = doc.importNode(el, true) as Element
    clone.removeAttribute(XSLT_ID_ATTR)
    el.parentNode.insertBefore(clone, el.nextSibling)
  })
}

export interface MoveRef {
  refId: string
  position: 'before' | 'after'
}

/** Görselin kaynağını değiştirir (logo/görsel üzerine dosya bırakma). */
export function setImageSrcInXslt(xsltSrc: string, id: string, dataUrl: string): string {
  return withDoc(xsltSrc, (doc) => {
    const el = findById(doc, id)
    if (el && /^img$/i.test(el.tagName)) el.setAttribute('src', dataUrl)
  })
}

/**
 * Tasarımın sayfa kabına (.page; yoksa ilk div'e) yeni literal HTML bloğu ekler.
 * Blok, doğrudan sayfa çocuğu yerine bir widget sarmalayıcısının içine konur;
 * böylece içteki öğe bölüm-sıralama yerine serbestçe taşınabilir.
 * marker verilirse sarmalayıcıya data-uni-insert işareti koyar (otomatik seçim).
 */
export function appendBlockToPage(
  xsltSrc: string,
  htmlLiteral: string,
  marker?: string
): string {
  return withDoc(xsltSrc, (doc) => {
    const container =
      doc.querySelector('.page') ??
      Array.from(doc.getElementsByTagName('div')).find((d) => !d.namespaceURI) ??
      null
    if (!container) return

    const wrapper = doc.createElement('div')
    wrapper.setAttribute('data-role', 'uni-widget')
    wrapper.setAttribute('style', 'position:relative;')
    if (marker) wrapper.setAttribute('data-uni-insert', marker)

    const frag = new DOMParser().parseFromString(
      `<root xmlns:xsl="http://www.w3.org/1999/XSL/Transform">${htmlLiteral}</root>`,
      'application/xml'
    )
    const errEl = frag.getElementsByTagName('parsererror')[0]
    if (errEl) return
    for (const child of Array.from(frag.documentElement.children)) {
      wrapper.appendChild(doc.importNode(child, true))
    }
    container.appendChild(wrapper)
  })
}

/** Kardeş düğümü belirtilen referansın önüne/arkasına taşır. */
export function moveXsltNode(xsltSrc: string, id: string, move: MoveRef): string {
  return withDoc(xsltSrc, (doc) => {
    const el = findById(doc, id)
    const ref = findById(doc, move.refId)
    if (!el || !ref || el === ref) return
    if (el.parentNode !== ref.parentNode || ref.parentNode === null) return
    if (move.position === 'before') ref.parentNode.insertBefore(el, ref)
    else ref.parentNode.insertBefore(el, ref.nextSibling)
  })
}
