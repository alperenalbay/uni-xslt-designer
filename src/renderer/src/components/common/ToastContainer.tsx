import { X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export function ToastContainer(): React.JSX.Element | null {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-12 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] shadow-lg backdrop-blur ${
            t.kind === 'error'
              ? 'border-red-500/40 bg-red-500/15 text-red-300 dark:text-red-200'
              : 'border-edge bg-panel/95 text-ink'
          }`}
        >
          <span>{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="text-secondary hover:text-ink">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
