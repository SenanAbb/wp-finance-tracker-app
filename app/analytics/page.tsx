"use client"

import { useEffect, useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { CumulativeDailyChart } from "@/components/analytics/cumulative-daily-chart"
import { DailyAvgProjection } from "@/components/analytics/daily-avg-projection"
import { MomComparisonChart } from "@/components/analytics/mom-comparison-chart"
import { TopExpenses } from "@/components/analytics/top-expenses"
import { ExpenseTreemap } from "@/components/analytics/expense-treemap"
import { ExpenseHeatmap } from "@/components/analytics/expense-heatmap"
import { HourlyDistribution } from "@/components/analytics/hourly-distribution"
import { MoneyFlowSankey } from "@/components/analytics/money-flow-sankey"
import { DateRangeFilter } from "@/components/filters/date-range-filter"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDateRangeFilter } from "@/hooks/useDateRangeFilter"

interface AnalyticsData {
  totalExpenses: number
  totalIncome: number
  prevTotalExpenses: number
  prevTotalIncome: number
  dailyAvg: number
  monthlyProjection: number
  daysElapsed: number
  rangeDays: number
  expensesData: { name: string; value: number }[]
  incomeData: { name: string; value: number }[]
  cumulativeData: { day: number; current: number; previous: number }[]
  heatmapData: { day: number; hour: number; count: number; total: number }[]
  maxHeatmapCount: number
  hourlyData: { hour: string; count: number; total: number }[]
  moneyFlowData: {
    categories: { name: string; value: number; percentage: number }[]
  }
  top5: { description: string; category: string; amount: number; date: string }[]
  treemapData: { name: string; size: number; pct: number }[]
  momData: { category: string; current: number; previous: number; change: number }[]
}

export default function AnalyticsPage() {
  const { dateRange, handleDateRangeChange } = useDateRangeFilter()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // Fetch analytics data when date range changes
  useEffect(() => {
    if (!dateRange) return

    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/analytics?from=${encodeURIComponent(dateRange.from.toISOString())}&to=${encodeURIComponent(dateRange.to.toISOString())}`,
          {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          },
        )

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const data = (await response.json()) as AnalyticsData
        setAnalyticsData(data)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (!dateRange) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando analítica...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="px-2 md:px-0">
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 md:mb-2">Analítica</h1>
            <p className="text-sm md:text-base text-muted-foreground">Análisis profundo de tus patrones de gasto</p>
          </div>

          <div className="sticky top-0 z-30 bg-background border-b border-border px-2 md:px-0 py-3 md:py-4 -mx-2 md:mx-0 md:border-0">
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} initialPreset="month" />
          </div>

          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Cargando analítica...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const {
    totalExpenses,
    totalIncome,
    dailyAvg,
    monthlyProjection,
    daysElapsed,
    rangeDays,
    expensesData,
    incomeData,
    cumulativeData,
    heatmapData,
    maxHeatmapCount,
    hourlyData,
    moneyFlowData,
    top5,
    treemapData,
    momData,
  } = analyticsData

  const currentLabel = `${format(dateRange.from, "d MMM", { locale: es })} - ${format(dateRange.to, "d MMM", { locale: es })}`
  const prevLabel = "Período anterior"

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="px-2 md:px-0">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 md:mb-2">Analítica</h1>
          <p className="text-sm md:text-base text-muted-foreground">Análisis profundo de tus patrones de gasto</p>
        </div>

        {/* Sticky Date Filter */}
        <div className="sticky top-0 z-30 bg-background border-b border-border px-2 md:px-0 py-3 md:py-4 -mx-2 md:mx-0 md:border-0">
          <DateRangeFilter onDateRangeChange={handleDateRangeChange} initialPreset="month" />
        </div>

        {loading && (
          <div className="px-2 md:px-0">
            <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
              Actualizando analítica...
            </div>
          </div>
        )}

        {/* Proyecciones y Tendencias */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">Proyecciones y Tendencias</h2>
          <p className="text-sm text-muted-foreground">
            Visualiza tu gasto diario promedio y proyecta cuánto gastarás al final del mes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 px-2 md:px-0">
          <DailyAvgProjection
            dailyAvg={dailyAvg}
            monthlyProjection={monthlyProjection}
            daysElapsed={daysElapsed}
            daysInMonth={rangeDays}
            totalSpent={totalExpenses}
          />
          <TopExpenses expenses={top5} />
        </div>

        {/* Gasto Acumulado Diario */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">Gasto Acumulado Diario</h2>
          <p className="text-sm text-muted-foreground">
            Compara tu gasto acumulado día a día con el período anterior.
          </p>
        </div>
        <div className="px-2 md:px-0">
          <CumulativeDailyChart
            data={cumulativeData}
            currentLabel={currentLabel}
            previousLabel={prevLabel}
          />
        </div>

        {/* Patrón de Gastos */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">Patrón de Gastos por Día y Hora</h2>
          <p className="text-sm text-muted-foreground">
            Identifica cuándo gastas más dinero.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 px-2 md:px-0">
          <ExpenseHeatmap data={heatmapData} maxValue={maxHeatmapCount} />
          <HourlyDistribution data={hourlyData} />
        </div>

        {/* Money Flow */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">¿A dónde va tu dinero?</h2>
          <p className="text-sm text-muted-foreground">
            Visualiza cómo se distribuyen tus ingresos entre categorías de gasto.
          </p>
        </div>
        <div className="px-2 md:px-0">
          <MoneyFlowSankey data={moneyFlowData} totalIncome={totalIncome} totalExpenses={totalExpenses} />
        </div>

        {/* Category Breakdowns */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">Desglose por Categoría</h2>
          <p className="text-sm text-muted-foreground">
            Análisis detallado de gastos e ingresos por categoría.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 px-2 md:px-0">
          <CategoryChart data={expensesData} title="Gastos por Categoría" />
          <CategoryChart data={incomeData} title="Ingresos por Categoría" />
        </div>

        {/* Análisis Comparativo */}
        <div className="space-y-2 mb-4 px-2 md:px-0">
          <h2 className="text-lg font-semibold">Análisis Comparativo</h2>
          <p className="text-sm text-muted-foreground">
            Visualiza la proporción relativa de gastos y compara con el período anterior.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 px-2 md:px-0">
          <ExpenseTreemap data={treemapData} total={totalExpenses} />
          <MomComparisonChart
            data={momData}
            currentLabel="Período actual"
            previousLabel="Período anterior"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
