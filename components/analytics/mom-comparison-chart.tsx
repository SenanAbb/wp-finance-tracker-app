"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MomData {
  category: string
  current: number
  previous: number
  change: number
}

interface MomComparisonChartProps {
  data: MomData[]
  currentLabel: string
  previousLabel: string
}

export function MomComparisonChart({ data, currentLabel, previousLabel }: MomComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación Mensual por Categoría</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mes actual vs. mes anterior — las barras rojas indican incremento &gt;20%
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barGap={2}>
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${v}`}
              />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.9 0.01 90)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                formatter={(value: any) => `€${Number(value).toFixed(2)}`}
              />
              <Legend
                formatter={(value) =>
                  value === "previous" ? previousLabel : currentLabel
                }
              />
              <Bar dataKey="previous" fill="var(--color-muted-foreground)" opacity={0.35} radius={[0, 4, 4, 0]} barSize={14} />
              <Bar dataKey="current" radius={[0, 4, 4, 0]} barSize={14}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.change > 20 ? "var(--color-accent)" : "var(--color-primary)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
