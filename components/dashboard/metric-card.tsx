import { ArrowDownIcon, ArrowUpIcon, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: number
  trend?: number
  type: "balance" | "income" | "expense"
  isSavingsRate?: boolean
}

export function MetricCard({ title, value, trend, type, isSavingsRate }: MetricCardProps) {
  const isPositive = type === "income" || (type === "balance" && (trend || 0) >= 0)
  const Icon = type === "balance" ? Wallet : type === "income" ? ArrowUpIcon : ArrowDownIcon
  
  const formattedValue = isSavingsRate
    ? `${value}%`
    : new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(value)

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn(
          "p-2 rounded-full",
          type === "expense" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      
      <div>
        <div className="font-display text-3xl font-bold tracking-tight">
          {formattedValue}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span className={cn(
              "font-medium",
              isPositive ? "text-primary" : "text-accent"
            )}>
              {isPositive ? "+" : ""}{trend}%
            </span>
            <span className="text-muted-foreground">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  )
}
