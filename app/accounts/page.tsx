import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Coins, TrendingUp, CreditCard } from "lucide-react"
import { getUserId } from "@/lib/auth/server"

export const revalidate = 0

const getAccountIcon = (type: string) => {
  switch (type) {
    case 'banco': return Building2
    case 'inversion': return TrendingUp
    case 'cash': return Coins
    default: return CreditCard
  }
}

export default async function AccountsPage() {
  const userId = await getUserId()

  const { data: accountsData } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  const totalBalance = accountsData?.reduce((acc, curr) => acc + Number(curr.balance), 0) || 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Cuentas</h1>
            <p className="text-muted-foreground">Gestiona tus cuentas bancarias, carteras e inversiones.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Patrimonio Total</p>
            <p className="text-3xl font-display font-bold tracking-tight text-primary">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(totalBalance)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(accountsData || []).map((account) => {
            const Icon = getAccountIcon(account.type)
            
            return (
              <Card key={account.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-surface border border-border group-hover:bg-primary/5 transition-colors">
                      <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-secondary text-secondary-foreground">
                      {account.type}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-1">{account.name}</h3>
                    <p className="font-display text-2xl font-bold tracking-tight">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: account.currency || "EUR",
                      }).format(Number(account.balance))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
