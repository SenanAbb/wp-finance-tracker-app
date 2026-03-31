"use client"

import { Treemap, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "oklch(0.5 0.15 140)",
  "oklch(0.6 0.18 40)",
  "oklch(0.7 0.1 250)",
  "oklch(0.8 0.15 80)",
  "oklch(0.6 0.15 300)",
  "oklch(0.4 0.1 200)",
  "oklch(0.55 0.12 160)",
  "oklch(0.65 0.14 20)",
  "oklch(0.5 0.1 280)",
  "oklch(0.7 0.12 60)",
]

type TreemapItem = {
  name: string
  size: number
  pct: number
  [key: string]: any
}

interface ExpenseTreemapProps {
  data: TreemapItem[]
  total: number
}

function CustomContent(props: any) {
  const { x, y, width, height, index, name, pct } = props
  if (width < 40 || height < 30) return null

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: "oklch(1 0 0)",
          strokeWidth: 2,
        }}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="oklch(0.98 0 0)"
            fontSize={12}
            fontWeight={600}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill="oklch(0.9 0 0)"
            fontSize={11}
          >
            {pct}%
          </text>
        </>
      )}
    </g>
  )
}

export function ExpenseTreemap({ data, total }: ExpenseTreemapProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Gastos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Proporción relativa por categoría — total: {fmt(total)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              nameKey="name"
              content={<CustomContent />}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(1 0 0)",
                  borderRadius: "8px",
                  border: "1px solid oklch(0.9 0.01 90)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                formatter={(value: any) => [`€${Number(value).toFixed(2)}`, "Gastado"]}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
