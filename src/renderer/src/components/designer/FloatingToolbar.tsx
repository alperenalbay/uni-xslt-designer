import { AlignCenter, AlignLeft, AlignRight, Copy, Trash2 } from 'lucide-react'
import {
  deleteXsltNode,
  duplicateXsltNode,
  setStyleInXslt
} from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import type { SelectionRect } from '@/hooks/usePreviewInteraction'
import { getSelectedEl } from '@/utils/previewDom'

interface FloatingToolbarProps {
  rect: SelectionRect | null
}

export function FloatingToolbar({ rect }: FloatingToolbarProps): React.JSX.Element | null {
  const selectedId = useEditorStore((s) => s.selectedXsltId)
  const setSelected = useEditorStore((s) => s.setSelectedXsltId)

  if (!rect || !selectedId) return null

  const left = Math.max(8, rect.x - 40)
  const top = Math.max(52, rect.y - 46)

  const patchStyle = (patch: Record<string, string>): void => {
    const { xslt, setXslt } = useEditorStore.getState()
    setXslt(setStyleInXslt(xslt, selectedId, patch))
  }

  const toggleBold = (): void => {
    const el = getSelectedEl()
    const cur = el ? getComputedStyle(el).fontWeight : '400'
    patchStyle({ 'font-weight': Number(cur) >= 600 ? '400' : '700' })
  }

  const toggleItalic = (): void => {
    const el = getSelectedEl()
    const cur = el ? getComputedStyle(el).fontStyle : 'normal'
    patchStyle({ 'font-style': cur === 'italic' ? 'normal' : 'italic' })
  }

  const align = (v: string): void => patchStyle({ 'text-align': v })

  const onDelete = (): void => {
    const { xslt, setXslt } = useEditorStore.getState()
    setXslt(deleteXsltNode(xslt, selectedId))
    setSelected(null)
  }

  const onDuplicate = (): void => {
    const { xslt, setXslt } = useEditorStore.getState()
    setXslt(duplicateXsltNode(xslt, selectedId))
  }

  return (
    <div className="floating-toolbar" style={{ left, top }} onMouseDown={(e) => e.stopPropagation()}>
      <button type="button" className="ft-btn" onClick={toggleBold} title="Kalın">
        <span className="font-bold">B</span>
      </button>
      <button type="button" className="ft-btn" onClick={toggleItalic} title="İtalik">
        <span className="italic font-serif">I</span>
      </button>
      <span className="ft-sep" />
      <button type="button" className="ft-btn" onClick={() => align('left')} title="Sola hizala">
        <AlignLeft size={14} />
      </button>
      <button type="button" className="ft-btn" onClick={() => align('center')} title="Ortala">
        <AlignCenter size={14} />
      </button>
      <button type="button" className="ft-btn" onClick={() => align('right')} title="Sağa hizala">
        <AlignRight size={14} />
      </button>
      <span className="ft-sep" />
      <label className="ft-btn cursor-pointer" title="Yazı rengi">
        <span
          className="block h-3.5 w-3.5 rounded-full border border-edge"
          style={{ background: getSelectedElColor() }}
        />
        <input
          type="color"
          className="hidden"
          onChange={(e) => patchStyle({ color: e.target.value })}
        />
      </label>
      <span className="ft-sep" />
      <button type="button" className="ft-btn" onClick={onDuplicate} title="Çoğalt">
        <Copy size={14} />
      </button>
      <button
        type="button"
        className="ft-btn text-red-500 hover:bg-red-500/10"
        onClick={onDelete}
        title="Sil (Delete)"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function getSelectedElColor(): string {
  const el = getSelectedEl()
  return el ? getComputedStyle(el).color : '#1a1a1a'
}
