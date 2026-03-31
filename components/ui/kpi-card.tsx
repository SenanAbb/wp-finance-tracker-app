import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string | number
  shortLabel?: string
  className?: string
  iconClassName?: string
}

export function KPICard({
  icon: Icon,
  label,
  value,
  shortLabel,
  className,
  iconClassName,
}: KPICardProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1 p-3 md:p-4 rounded-lg md:rounded-xl bg-surface border border-border",
      className
    )}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5", iconClassName)} />
        {shortLabel && <span className="sm:hidden">{shortLabel}</span>}
        {label && <span className="hidden sm:inline">{label}</span>}
      </div>
      <span className="font-display text-lg md:text-xl font-bold tracking-tight">
        {value}
      </span>
    </div>
  )
}
