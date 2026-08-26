import { useToastStore } from '@/store/toastStore'
import type { UniApi } from '../../../preload/index.d'

/**
 * Ana süreç API'sine güvenli erişim (web/geliştirme ortamında yoksa nazikçe uyarır).
 */
export const uniApi: UniApi | null =
  typeof window !== 'undefined' && 'uniApi' in window ? window.uniApi : null

function requireApi(): UniApi {
  if (!uniApi) {
    useToastStore.getState().push('Bu işlem yalnızca masaüstü uygulamasında çalışır.', 'error')
    throw new Error('uniApi unavailable')
  }
  return uniApi
}

export async function openXmlOrXslt(kind: 'xml' | 'xslt'): Promise<{ content: string; name: string } | null> {
  const res = await requireApi().openFile({
    title: kind === 'xml' ? 'XML Verisi Aç' : 'XSLT Tasarımı Aç',
    extensions: kind === 'xml' ? ['xml'] : ['xslt', 'xsl', 'xml']
  })
  if (!res) return null
  if (res.error || res.content === undefined) {
    useToastStore.getState().push(`Dosya okunamadı: ${res.error ?? '?'}`, 'error')
    return null
  }
  return { content: res.content, name: res.name ?? res.path ?? '' }
}

export async function saveTextFile(
  defaultName: string,
  content: string,
  extensions: string[]
): Promise<boolean> {
  const res = await requireApi().saveFile({ defaultName, content, extensions })
  if (!res || res.canceled) return false
  if (res.error) {
    useToastStore.getState().push(`Kaydedilemedi: ${res.error}`, 'error')
    return false
  }
  useToastStore.getState().push(`Kaydedildi: ${res.path}`)
  return true
}

export async function exportPdf(cleanHtml: string): Promise<void> {
  try {
    const res = await requireApi().exportPdf(cleanHtml)
    if (!res || res.canceled) return
    if (res.error) {
      useToastStore.getState().push(`PDF oluşturulamadı: ${res.error}`, 'error')
      return
    }
    useToastStore.getState().push(`PDF kaydedildi: ${res.path}`)
  } catch {
    /* toast zaten verildi */
  }
}

export interface UserTemplate {
  fileName: string
  name: string
  content: string
}

export async function listUserTemplates(): Promise<UserTemplate[]> {
  if (!uniApi) return []
  return uniApi.listTemplates()
}

export async function saveUserTemplate(name: string, content: string): Promise<boolean> {
  const res = await requireApi().saveTemplate({ name, content })
  if (res.error) {
    useToastStore.getState().push(`Şablon kaydedilemedi: ${res.error}`, 'error')
    return false
  }
  useToastStore.getState().push('Şablon kütüphaneye eklendi.')
  return true
}

export async function deleteUserTemplate(fileName: string): Promise<void> {
  const res = await requireApi().deleteTemplate({ fileName })
  if (res.error) useToastStore.getState().push(`Silinemedi: ${res.error}`, 'error')
}
