import { DOC_TYPE_LABELS, useUiStore } from '@/store/uiStore'
import { usePreviewStore } from '@/store/previewStore'

export function StatusBar(): React.JSX.Element {
  const docType = useUiStore((s) => s.docType)
  const issues = usePreviewStore((s) => s.issues)
  const html = usePreviewStore((s) => s.html)
  const busy = usePreviewStore((s) => s.busy)
  const scale = usePreviewStore((s) => s.effectiveScale)

  const errors = issues.filter((i) => i.level === 'error')
  const warns = issues.filter((i) => i.level === 'warn')

  let chip = <span className="status-chip is-idle">Hazır</span>
  if (busy) chip = <span className="status-chip is-idle">Dönüştürülüyor…</span>
  else if (errors.length > 0)
    chip = <span className="status-chip is-error">Hata: {errors[0].message.slice(0, 60)}</span>
  else if (warns.length > 0)
    chip = <span className="status-chip is-warn" title={warns[0].message}>Uyarı: {warns[0].message.slice(0, 60)}</span>
  else if (html) chip = <span className="status-chip is-ok">UBL-TR 1.2 · Doğrulandı</span>

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-edge bg-panel px-3 text-[11px] text-secondary">
      <div className="flex min-w-0 items-center gap-3">
        {chip}
        {html ? (
          <span className="font-mono whitespace-nowrap">{DOC_TYPE_LABELS[docType]} · UBL</span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {html ? (
          <>
            <span className="font-mono">%{Math.round(scale * 100)}</span>
            <span>Belge açık</span>
          </>
        ) : null}
      </div>
    </footer>
  )
}
