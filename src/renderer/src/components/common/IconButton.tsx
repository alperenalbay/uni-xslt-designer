import type { LucideIcon } from 'lucide-react'

interface IconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  disabled?: boolean
  active?: boolean
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  active = false
}: IconButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`icon-btn ${active ? 'is-active' : ''}`}
    >
      <Icon size={16} strokeWidth={1.8} />
    </button>
  )
}
