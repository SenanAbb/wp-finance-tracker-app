"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DayData {
  day: number
  current: number
  previous: number
}

interface CumulativeDailyChartProps {
  data: DayData[]
  currentLabel: string
  previousLabel: string
}

export function CumulativeDailyChart({ data, currentLabel, previousLabel }: CumulativeDailyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gasto Acumulado Diario</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparación del ritmo de gasto día a día vs. mes anterior
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="previousGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-muted-foreground)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-muted-foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.9 0.01 90)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                formatter={(value: any, name: any) => [
                  `€${Number(value).toFixed(2)}`,
                  name === "current" ? currentLabel : previousLabel,
                ]}
                labelFormatter={(label) => `Día ${label}`}
              />
              <Legend
                formatter={(value) => (value === "current" ? currentLabel : previousLabel)}
              />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--color-muted-foreground)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="url(#previousGrad)"
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#currentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
