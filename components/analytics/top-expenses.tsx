import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopExpense {
  description: string
  category: string
  amount: number
  date: string
}

interface TopExpensesProps {
  expenses: TopExpense[]
}

export function TopExpenses({ expenses }: TopExpensesProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Gastos del Mes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Las transacciones individuales más grandes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-display font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {expense.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                    {expense.category}
                  </span>
                  <span>{expense.date}</span>
                </div>
              </div>
              <span className="font-display font-bold text-sm shrink-0">
                {fmt(expense.amount)}
              </span>
            </div>
          ))}
          {expenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay gastos este mes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
