import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagProps {
  label: string
  selected?: boolean
  onToggle?: () => void
  onRemove?: () => void
  variant?: "default" | "outline"
  size?: "sm" | "md"
}

export function Tag({
  label,
  selected = false,
  onToggle,
  onRemove,
  variant = "default",
  size = "md",
}: TagProps) {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors cursor-pointer"
  
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  }

  const variantClasses = {
    default: selected
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-surface text-muted-foreground hover:bg-surface-hover",
    outline: "border border-border text-foreground hover:bg-surface-hover",
  }

  return (
    <button
      onClick={onToggle}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant])}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </button>
  )
}
