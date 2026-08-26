import type { DocType } from '@/store/uiStore'
import {
  makeBlank,
  makeCorporateDespatch,
  makeCorporateInvoice,
  makeSimpleDespatch,
  makeSimpleInvoice
} from './factories'

export interface BuiltInTemplate {
  id: string
  name: string
  description: string
  xslt: string
}

export const BUILT_IN_TEMPLATES: Record<DocType, BuiltInTemplate[]> = {
  fatura: [
    {
      id: 'fatura-kurumsal',
      name: 'Kurumsal',
      description: 'Logo, taraflar, ürünler tablosu ve toplamlar içeren tam tasarım.',
      xslt: makeCorporateInvoice('E-FATURA')
    },
    {
      id: 'fatura-sade',
      name: 'Sade',
      description: 'Tek renk, hızlı baskı dostu sade tablo düzeni.',
      xslt: makeSimpleInvoice('e-Fatura')
    },
    {
      id: 'fatura-bos',
      name: 'Boş Sayfa',
      description: 'Sıfırdan kendi tasarımınızı kurmak için iskelet.',
      xslt: makeBlank('Belge Başlığı')
    }
  ],
  arsiv: [
    {
      id: 'arsiv-kurumsal',
      name: 'Kurumsal',
      description: 'e-Arşiv için kurumsal üst bilgi ve toplamlı tam tasarım.',
      xslt: makeCorporateInvoice('E-ARŞİV FATURA')
    },
    {
      id: 'arsiv-sade',
      name: 'Sade',
      description: 'e-Arşiv için sade ve hızlı düzen.',
      xslt: makeSimpleInvoice('e-Arşiv Fatura')
    },
    {
      id: 'arsiv-bos',
      name: 'Boş Sayfa',
      description: 'e-Arşiv tasarımları için boş iskelet.',
      xslt: makeBlank('e-Arşiv Fatura')
    }
  ],
  irsaliye: [
    {
      id: 'irsaliye-kurumsal',
      name: 'Kurumsal',
      description: 'Sevk/teslim bilgileri, araç-sürücü künyesi ve satırlar.',
      xslt: makeCorporateDespatch('E-İRSALİYE')
    },
    {
      id: 'irsaliye-sade',
      name: 'Sade',
      description: 'İrsaliye için sade tablo düzeni.',
      xslt: makeSimpleDespatch('e-İrsaliye')
    },
    {
      id: 'irsaliye-bos',
      name: 'Boş Sayfa',
      description: 'İrsaliye tasarımları için boş iskelet.',
      xslt: makeBlank('e-İrsaliye')
    }
  ]
}

export function getTemplate(docType: DocType, templateId: string): BuiltInTemplate | undefined {
  return BUILT_IN_TEMPLATES[docType].find((t) => t.id === templateId)
}
