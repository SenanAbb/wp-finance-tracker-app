import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DailyAvgProjectionProps {
  dailyAvg: number
  monthlyProjection: number
  daysElapsed: number
  daysInMonth: number
  totalSpent: number
  budgetLimit?: number
}

export function DailyAvgProjection({
  dailyAvg,
  monthlyProjection,
  daysElapsed,
  daysInMonth,
  totalSpent,
  budgetLimit,
}: DailyAvgProjectionProps) {
  const daysRemaining = daysInMonth - daysElapsed
  const isOverBudget = budgetLimit ? monthlyProjection > budgetLimit : false
  const projectionPct = budgetLimit ? Math.round((monthlyProjection / budgetLimit) * 100) : null

  const fmt = (v: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ritmo de Gasto</CardTitle>
        <p className="text-sm text-muted-foreground">
          Proyección basada en tu media diaria este mes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Media diaria
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              {fmt(dailyAvg)}
            </span>
            <span className="text-xs text-muted-foreground">
              {daysElapsed} de {daysInMonth} días
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              Proyección mensual
            </div>
            <span
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                isOverBudget ? "text-accent" : "text-foreground"
              )}
            >
              {fmt(monthlyProjection)}
            </span>
            {projectionPct !== null && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isOverBudget ? "text-accent" : "text-primary"
                )}
              >
                {projectionPct}% del presupuesto
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Gastado hasta hoy</span>
            <span className="font-display text-xl font-bold tracking-tight">
              {fmt(totalSpent)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Días restantes</span>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight">
                {daysRemaining}
              </span>
              {daysRemaining <= 7 ? (
                <TrendingDown className="w-4 h-4 text-accent" />
              ) : (
                <TrendingUp className="w-4 h-4 text-primary" />
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progreso del mes</span>
            <span>{Math.round((daysElapsed / daysInMonth) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isOverBudget ? "bg-accent" : "bg-primary"
              )}
              style={{ width: `${Math.min((daysElapsed / daysInMonth) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
