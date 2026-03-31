"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface MoneyFlowData {
  categories: Array<{ name: string; value: number; percentage: number }>
}

interface MoneyFlowSankeyProps {
  data: MoneyFlowData
  totalIncome: number
  totalExpenses: number
}

const colors = [
  "bg-emerald-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-teal-500",
]

export function MoneyFlowSankey({ data, totalIncome, totalExpenses }: MoneyFlowSankeyProps) {
  const savingsAmount = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>¿A dónde va tu dinero?</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Distribución de ingresos por categoría de gasto
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary stats at top */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Ingresos</p>
              <p className="font-display text-xl font-bold text-primary">
                €{totalIncome.toFixed(0)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-xs text-muted-foreground mb-2">Gastos</p>
              <p className="font-display text-xl font-bold text-accent">
                €{totalExpenses.toFixed(0)}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${savingsAmount >= 0 ? "bg-primary/5 border border-primary/20" : "bg-accent/5 border border-accent/20"}`}>
              <p className="text-xs text-muted-foreground mb-2">Ahorro</p>
              <p className={`font-display text-xl font-bold ${savingsAmount >= 0 ? "text-primary" : "text-accent"}`}>
                €{savingsAmount.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{savingsRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Distribution bars */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Distribución de Gastos</p>
            {data.categories.map((cat, idx) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    €{cat.value.toFixed(0)} ({cat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-6 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${colors[idx % colors.length]} transition-all`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Savings bar */}
            {savingsAmount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-primary">Ahorro</span>
                  <span className="text-xs text-muted-foreground">
                    €{savingsAmount.toFixed(0)} ({savingsRate.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-6 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${savingsRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
