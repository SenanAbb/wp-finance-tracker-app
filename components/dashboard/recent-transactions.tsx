import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Transaction {
  id: string
  amount: number
  type: string
  category: string
  description?: string
  date: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.description || transaction.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(transaction.date, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <div className={cn(
                "font-medium",
                transaction.type === "expense" ? "text-foreground" : "text-primary"
              )}>
                {transaction.type === "expense" ? "-" : "+"}
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                }).format(transaction.amount)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay transacciones recientes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
