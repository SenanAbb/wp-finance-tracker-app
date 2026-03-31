import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions, Transaction } from "@/components/dashboard/recent-transactions"
import { supabase } from "@/lib/supabase/client"
import { getUserId } from "@/lib/auth/server"

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const revalidate = 0 // Disable cache for real-time updates

export default async function Home() {
  const userId = await getUserId()

  // Fetch recent transactions for this user
  const { data: transactionsData } = await supabase
    .from('transactions')
    .select(`
      id, 
      amount, 
      type, 
      description, 
      created_at,
      categories (name)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch accounts for this user
  const { data: accountsData } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .is('archived_at', null)

  const totalBalance = accountsData?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0
  
  // Current month boundaries
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Previous month boundaries (for trend calculation)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Fetch current + previous month transactions in one query (last 2 months)
  const { data: twoMonthsTx } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .eq('user_id', userId)
    .gte('created_at', startOfPrevMonth.toISOString())

  const thisMonthTx = (twoMonthsTx || []).filter(
    tx => new Date(tx.created_at) >= startOfMonth
  )
  const prevMonthTx = (twoMonthsTx || []).filter(
    tx => new Date(tx.created_at) >= startOfPrevMonth && new Date(tx.created_at) < startOfMonth
  )

  const monthlyIncome = thisMonthTx
    .filter(tx => tx.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const monthlyExpenses = thisMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const prevIncome = prevMonthTx
    .filter(tx => tx.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const prevExpenses = prevMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  // Calculate MoM trends (%)
  const incomeTrend = prevIncome > 0
    ? Math.round(((monthlyIncome - prevIncome) / prevIncome) * 100)
    : undefined

  const expenseTrend = prevExpenses > 0
    ? Math.round(((monthlyExpenses - prevExpenses) / prevExpenses) * 100)
    : undefined

  // Savings rate: (income - expenses) / income * 100
  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0

  // Format transactions for the component
  const recentTransactions: Transaction[] = (transactionsData || []).map(tx => {
    const categoryData = tx.categories as unknown as { name: string } | null
    
    return {
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.type,
      category: capitalize(categoryData?.name || 'otros'),
      description: tx.description,
      date: new Date(tx.created_at)
    }
  })

  // Build real chart data: expenses per month for the last 6 months
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const { data: chartTx } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('created_at', sixMonthsAgo.toISOString())

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const chartData: { name: string; total: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextD = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const total = (chartTx || [])
      .filter(tx => {
        const txDate = new Date(tx.created_at)
        return txDate >= d && txDate < nextD
      })
      .reduce((acc, curr) => acc + Number(curr.amount), 0)
    chartData.push({ name: monthNames[d.getMonth()], total })
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Resumen</h1>
          <p className="text-muted-foreground">Controla tu situación financiera de un vistazo.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Balance Total"
            value={totalBalance}
            type="balance"
          />
          <MetricCard
            title="Ingresos del Mes"
            value={monthlyIncome}
            type="income"
            trend={incomeTrend}
          />
          <MetricCard
            title="Gastos del Mes"
            value={monthlyExpenses}
            type="expense"
            trend={expenseTrend}
          />
          <MetricCard
            title="Tasa de Ahorro"
            value={savingsRate}
            type="balance"
            isSavingsRate
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <OverviewChart data={chartData} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </DashboardLayout>
  )
}
