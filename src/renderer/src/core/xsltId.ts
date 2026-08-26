/**
 * data-xslt-id kimlik eşleme mimarisi.
 *
 * WYSIWYG modunda önizlemedeki her HTML öğesinin hangi XSLT düğümünden
 * geldiğini bilmek gerekir. Dönüşüm öncesinde XSLT şablonundaki çıktı
 * üreten her elemana sıralı geçici bir `data-xslt-id` atanır; böylece
 * önizleme DOM'unda id → XSLT düğümü eşlemesi yapılabilir. Kimlikler
 * yalnızca bellek-içi yaşar, diske kaydetmeden önce mutlaka strip edilir.
 */

export const XSLT_ID_ATTR = 'data-xslt-id'
export const XSLT_NS = 'http://www.w3.org/1999/XSL/Transform'

function isResultElement(el: Element): boolean {
  // xsl: namespace'indeki talimatlar çıktı üretmez; literal sonuç elemanları üretir.
  return el.namespaceURI !== XSLT_NS
}

function removeExistingIds(doc: Document): void {
  doc.querySelectorAll(`[${XSLT_ID_ATTR}]`).forEach((el) => {
    el.removeAttribute(XSLT_ID_ATTR)
  })
}

/** XSLT metnini DOM'a ayrıştırır; hata durumunda null döner. */
export function parseXmlDocument(src: string): Document | null {
  try {
    const doc = new DOMParser().parseFromString(src, 'application/xml')
    if (doc.getElementsByTagName('parsererror').length > 0) return null
    return doc
  } catch {
    return null
  }
}

export interface XsltIdMeta {
  tag: string
  /** Aynı etiket adına sahip sonuç elemanları içindeki sıra (0 tabanlı) */
  ordinal: number
}

export interface InjectedXslt {
  doc: Document
  serialized: string
  /** Atanan toplam kimlik sayısı */
  count: number
  /** id → kaynak kodda arama imzası (kod-satırı eşitleme için) */
  meta: Record<string, XsltIdMeta>
}

/**
 * XSLT dokümanındaki tüm sonuç elemanlarına sıralı data-xslt-id enjekte eder.
 * Var olan kimlikleri önce temizler (idempotent).
 */
export function injectXsltIds(xsltSrc: string): InjectedXslt | null {
  const doc = parseXmlDocument(xsltSrc)
  if (!doc) return null

  removeExistingIds(doc)

  let counter = 0
  const meta: Record<string, XsltIdMeta> = {}
  const ordinalByTag = new Map<string, number>()
  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_ELEMENT)
  let current: Node | null = walker.currentNode
  while (current) {
    if (current instanceof Element && isResultElement(current)) {
      counter += 1
      const id = String(counter)
      current.setAttribute(XSLT_ID_ATTR, id)
      const tag = current.tagName
      const ordinal = ordinalByTag.get(tag) ?? 0
      meta[id] = { tag, ordinal }
      ordinalByTag.set(tag, ordinal + 1)
    }
    current = walker.nextNode()
  }

  return {
    doc,
    serialized: new XMLSerializer().serializeToString(doc),
    count: counter,
    meta
  }
}

/** XSLT metnindeki tüm data-xslt-id özniteliklerini temizler. */
export function stripXsltIds(xsltSrc: string): string {
  const doc = parseXmlDocument(xsltSrc)
  if (!doc) return xsltSrc

  removeExistingIds(doc)
  const out = new XMLSerializer().serializeToString(doc)

  // Ayrıştırıcı-serializer döngüsü bozulma yaratmış olabilir; kimlik yoksa orijinali koru.
  const hadIds = /data-xslt-id=/.test(xsltSrc)
  if (!hadIds) return xsltSrc
  return out
}

/** Verilen DOM'da id'ye karşılık gelen önizleme elemanını bulur. */
export function findByXsltId(root: Document | Element, id: string): Element | null {
  return root.querySelector(`[${XSLT_ID_ATTR}="${CSS.escape(id)}"]`)
}
