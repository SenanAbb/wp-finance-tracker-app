"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HeatmapData {
  day: number // 0-6 (Sunday-Saturday)
  hour: number // 0-3 (morning, midday, afternoon, evening)
  count: number
  total: number
}

interface ExpenseHeatmapProps {
  data: HeatmapData[]
  maxValue: number
}

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const HOURS = ["Mañana\n(6-12)", "Mediodía\n(12-18)", "Tarde\n(18-21)", "Noche\n(21-6)"]

function getHeatColor(value: number, max: number): string {
  if (value === 0) return "bg-muted"
  const ratio = value / max
  if (ratio < 0.25) return "bg-blue-100 dark:bg-blue-900"
  if (ratio < 0.5) return "bg-blue-300 dark:bg-blue-700"
  if (ratio < 0.75) return "bg-orange-300 dark:bg-orange-700"
  return "bg-red-400 dark:bg-red-600"
}

export function ExpenseHeatmap({ data, maxValue }: ExpenseHeatmapProps) {
  const gridData = Array(7)
    .fill(null)
    .map(() => Array(4).fill(null))

  data.forEach((item) => {
    gridData[item.day][item.hour] = item
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patrón de Gastos por Día y Hora</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Identifica cuándo gastas más. Rojo = mayor actividad de gasto
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header row with hours */}
            <div className="flex gap-1 mb-2">
              <div className="w-12" /> {/* Empty corner */}
              {HOURS.map((hour, i) => (
                <div
                  key={i}
                  className="w-20 text-center text-xs font-medium text-muted-foreground whitespace-pre-line"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {gridData.map((row, dayIndex) => (
              <div key={dayIndex} className="flex gap-1 mb-1">
                <div className="w-12 text-xs font-medium text-muted-foreground flex items-center justify-center">
                  {DAYS[dayIndex]}
                </div>
                {row.map((cell, hourIndex) => (
                  <div
                    key={`${dayIndex}-${hourIndex}`}
                    className={`w-20 h-16 rounded flex flex-col items-center justify-center text-xs font-medium cursor-default transition-all hover:ring-2 hover:ring-primary ${
                      cell ? getHeatColor(cell.count, maxValue) : "bg-muted"
                    }`}
                    title={
                      cell
                        ? `${cell.count} transacciones\n€${cell.total.toFixed(2)}`
                        : "Sin datos"
                    }
                  >
                    {cell && cell.count > 0 && (
                      <>
                        <div className="font-bold">{cell.count}</div>
                        <div className="text-xs opacity-75">€{cell.total.toFixed(0)}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Intensidad:</span>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded bg-muted" title="Sin datos" />
            <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900" title="Bajo" />
            <div className="w-6 h-6 rounded bg-blue-300 dark:bg-blue-700" title="Medio-bajo" />
            <div className="w-6 h-6 rounded bg-orange-300 dark:bg-orange-700" title="Medio-alto" />
            <div className="w-6 h-6 rounded bg-red-400 dark:bg-red-600" title="Alto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
