import { useEffect, useState } from 'react'
import { parseStyleAttr } from '@/core/xsltWrite'
import { setStyleInXslt } from '@/core/xsltWrite'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'
import { getSelectedEl } from '@/utils/previewDom'

/** Seçili öğenin canlı biçim değerlerini gösteren bağlamsal panel. */
export function PropertiesPanel(): React.JSX.Element | null {
  const selectedId = useEditorStore((s) => s.selectedXsltId)
  const html = usePreviewStore((s) => s.html)
  const [, force] = useState(0)

  useEffect(() => {
    force((x) => x + 1)
  }, [selectedId, html])

  if (!selectedId) return null

  const el = getSelectedEl()
  if (!el) return null

  const cs = getComputedStyle(el)
  const inlineStyle = el.getAttribute('style') ?? ''
  const inline = parseStyleAttr(inlineStyle)

  const { xslt, setXslt } = useEditorStore.getState()
  const patch = (p: Record<string, string>): void =>
    setXslt(setStyleInXslt(xslt, selectedId, p))

  const numOrNull = (v: string | undefined): number | null =>
    v !== undefined && v !== '' ? Math.round(parseFloat(v)) : null

  const fontSize = numOrNull(inline['font-size']) ?? parseInt(cs.fontSize, 10)
  const fontWeight = inline['font-weight'] ?? cs.fontWeight
  const fontStyle = inline['font-style'] ?? cs.fontStyle
  const textAlign = inline['text-align'] ?? cs.textAlign
  const color = rgbToHex(inline['color'] ?? cs.color)
  const bg = rgbToHex(inline['background-color'] ?? cs.backgroundColor)
  const radius = numOrNull(inline['border-radius']) ?? Math.round(parseFloat(cs.borderRadius) || 0)

  return (
    <div className="flex flex-col gap-3 text-[12px]">
      <div className="flex items-center gap-2">
        <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent-strong">
          &lt;{el.tagName.toLowerCase()}&gt;
        </span>
        <span className="font-mono text-[10px] text-secondary">#{selectedId}</span>
      </div>

      <Row label="Yazı Boyutu">
        <NumberBox
          value={fontSize}
          suffix="px"
          onChange={(v) => patch({ 'font-size': `${v}px` })}
        />
        <Toggle active={Number(fontWeight) >= 600} label="B" onClick={() => patch({ 'font-weight': Number(fontWeight) >= 600 ? '400' : '700' })} />
        <Toggle active={fontStyle === 'italic'} label="I" italic onClick={() => patch({ 'font-style': fontStyle === 'italic' ? 'normal' : 'italic' })} />
      </Row>

      <Row label="Hizalama">
        <Segmented
          value={textAlign}
          options={[
            ['left', 'Sol'],
            ['center', 'Orta'],
            ['right', 'Sağ']
          ]}
          onChange={(v) => patch({ 'text-align': v })}
        />
      </Row>

      <Row label="Yazı Rengi">
        <ColorBox value={color} onChange={(v) => patch({ color: v })} onClear={() => patch({ color: '' })} />
      </Row>

      <Row label="Zemin">
        <ColorBox value={bg === '#00000000' || bg === 'transparent' ? '' : bg} onChange={(v) => patch({ 'background-color': v })} onClear={() => patch({ 'background-color': '' })} />
      </Row>

      <Row label="Köşe Yuvarlaklığı">
        <NumberBox value={radius} suffix="px" onChange={(v) => patch({ 'border-radius': `${v}px` })} />
      </Row>

      <p className="text-secondary text-[10.5px] leading-relaxed">
        Değişiklikler doğrudan XSLT koduna yazılır · Çift tıkla metni düzenle · Delete ile sil
      </p>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="micro-label shrink-0">{label}</span>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </div>
  )
}

function NumberBox({
  value,
  suffix,
  onChange
}: {
  value: number
  suffix?: string
  onChange: (v: number) => void
}): React.JSX.Element {
  return (
    <span className="flex items-center rounded-md border border-edge bg-panel-2 px-1.5">
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 bg-transparent py-1 text-right font-mono text-[11px] outline-none [appearance:textfield]"
      />
      {suffix && <span className="pl-0.5 font-mono text-[10px] text-secondary">{suffix}</span>}
    </span>
  )
}

function Toggle({
  active,
  label,
  italic,
  onClick
}: {
  active: boolean
  label: string
  italic?: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-6 w-6 rounded-md border text-[11px] ${
        active
          ? 'border-accent bg-accent-soft text-accent-strong'
          : 'border-edge bg-panel-2 text-secondary hover:text-ink'
      } ${italic ? 'italic font-serif' : 'font-bold'}`}
    >
      {label}
    </button>
  )
}

function Segmented({
  value,
  options,
  onChange
}: {
  value: string
  options: Array<[string, string]>
  onChange: (v: string) => void
}): React.JSX.Element {
  return (
    <span className="flex rounded-md border border-edge bg-panel-2 p-0.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded px-2 py-0.5 text-[10.5px] font-semibold ${
            value === v ? 'bg-accent-soft text-accent-strong' : 'text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </span>
  )
}

function ColorBox({
  value,
  onChange,
  onClear
}: {
  value: string
  onChange: (v: string) => void
  onClear: () => void
}): React.JSX.Element {
  return (
    <span className="flex items-center gap-1">
      <label className="relative h-6 w-9 cursor-pointer overflow-hidden rounded-md border border-edge">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -left-2 -top-2 h-12 w-16 cursor-pointer border-0 p-0"
        />
      </label>
      <button
        type="button"
        onClick={onClear}
        title="Devralına dön"
        className="rounded px-1 font-mono text-[10px] text-secondary hover:text-ink"
      >
        ✕
      </button>
    </span>
  )
}

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i)
  if (!m) return rgb.startsWith('#') ? rgb : ''
  const hex = (n: string): string => Number(n).toString(16).padStart(2, '0')
  return `#${hex(m[1])}${hex(m[2])}${hex(m[3])}`
}
