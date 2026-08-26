import { X } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { useUiStore } from '@/store/uiStore'
import { useToastStore } from '@/store/toastStore'

/** XML'de gömülü tasarım bulunca üstte gösterilen uygulama teklifi. */
export function EmbedBanner(): React.JSX.Element | null {
  const offer = useUiStore((s) => s.embedOffer)
  const clear = useUiStore((s) => s.offerEmbed)
  if (!offer) return null
  const current = offer

  function apply(): void {
    useEditorStore.getState().setXslt(current.xslt)
    useToastStore.getState().push(`Gömülü tasarım uygulandı: ${current.label}`)
    clear(null)
  }

  return (
    <div className="embed-banner">
      <span className="text-[12px]">
        <strong>"{offer.label}"</strong> — bu XML içinde gömülü tasarım bulundu.
        Orijinal görünümü düzenlemek için uygulayabilirsiniz.
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" className="btn-primary !py-1.5 !px-3" onClick={apply}>
          Gömülü Tasarımı Uygula
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Yoksay"
          onClick={() => clear(null)}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
