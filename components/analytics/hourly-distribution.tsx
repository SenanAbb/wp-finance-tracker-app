"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface HourlyData {
  hour: string
  count: number
  total: number
}

interface HourlyDistributionProps {
  data: HourlyData[]
}

const colors = [
  "oklch(0.5 0.15 140)", // Emerald
  "oklch(0.6 0.18 40)",  // Terracotta
  "oklch(0.7 0.1 250)",  // Blue
  "oklch(0.8 0.15 80)",  // Yellow/Orange
]

export function HourlyDistribution({ data }: HourlyDistributionProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Franja Horaria</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Número de transacciones y monto total por franja horaria
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.9 0.01 90)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                formatter={(value: any) => {
                  if (typeof value === "number" && value > 100) {
                    return `€${value.toFixed(2)}`
                  }
                  return value
                }}
              />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
