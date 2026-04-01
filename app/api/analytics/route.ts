import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { supabaseServer } from '@/lib/supabase/server'

const API_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && /localhost|127\.0\.0\.1/.test(envUrl)) return envUrl
  return '/api'
})()

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
  categories: { name: string } | null
  accounts: { name: string } | null
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const accessToken = request.cookies.get('accessToken')?.value

  if (!accessToken) {
    return null
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as { ok?: boolean; userId?: string }

  if (!data.ok || !data.userId) {
    return null
  }

  return data.userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required query params: from, to' },
        { status: 400 },
      )
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    const rangeDurationMs = toDate.getTime() - fromDate.getTime()
    const prevFrom = new Date(fromDate.getTime() - rangeDurationMs)

    const { data: allTxRaw, error } = await supabaseServer
      .from('transactions')
      .select(
        'id, amount, type, description, created_at, categories (name), accounts (name)',
      )
      .eq('user_id', userId)
      .gte('created_at', prevFrom.toISOString())
      .lte('created_at', toDate.toISOString())

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const allTx = (allTxRaw as unknown as Transaction[]) || []
    const fromIso = fromDate.toISOString()
    const prevFromIso = prevFrom.toISOString()

    const currentExpenses = allTx.filter(
      (tx) => tx.created_at >= fromIso && tx.type === 'expense',
    )
    const currentIncome = allTx.filter(
      (tx) => tx.created_at >= fromIso && tx.type === 'income',
    )
    const prevExpenses = allTx.filter(
      (tx) => tx.created_at < fromIso && tx.created_at >= prevFromIso && tx.type === 'expense',
    )
    const prevIncome = allTx.filter(
      (tx) => tx.created_at < fromIso && tx.created_at >= prevFromIso && tx.type === 'income',
    )

    const totalExpenses = currentExpenses.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const totalIncome = currentIncome.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const prevTotalExpenses = prevExpenses.reduce((acc, tx) => acc + Number(tx.amount), 0)
    const prevTotalIncome = prevIncome.reduce((acc, tx) => acc + Number(tx.amount), 0)

    const rangeDays = Math.max(
      1,
      Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)),
    )
    const now = new Date()
    const daysElapsed = Math.max(
      1,
      Math.min(
        rangeDays,
        Math.ceil((now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)),
      ),
    )
    const dailyAvg = totalExpenses / daysElapsed
    const monthlyProjection = dailyAvg * rangeDays

    const groupByCategory = (transactions: Transaction[]) =>
      Array.from(
        transactions.reduce<Map<string, number>>((acc, tx) => {
          const categoryName = tx.categories?.name
          if (!categoryName) return acc
          const normalized = capitalize(categoryName)
          acc.set(normalized, (acc.get(normalized) || 0) + Number(tx.amount))
          return acc
        }, new Map()).entries(),
      ).map(([name, value]) => ({ name, value }))

    const expensesData = groupByCategory(currentExpenses)
    const incomeData = groupByCategory(currentIncome)

    const dailyTotals: Record<string, number> = {}
    const dailyPrevTotals: Record<string, number> = {}

    currentExpenses.forEach((tx) => {
      const day = format(new Date(tx.created_at), 'yyyy-MM-dd')
      dailyTotals[day] = (dailyTotals[day] || 0) + Number(tx.amount)
    })

    prevExpenses.forEach((tx) => {
      const day = format(new Date(tx.created_at), 'yyyy-MM-dd')
      dailyPrevTotals[day] = (dailyPrevTotals[day] || 0) + Number(tx.amount)
    })

    let cumulative = 0
    let prevCumulative = 0
    const cumulativeData = Array.from({ length: rangeDays }, (_, i) => {
      const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dayStr = format(date, 'yyyy-MM-dd')
      const prevDate = new Date(prevFrom.getTime() + i * 24 * 60 * 60 * 1000)
      const prevDayStr = format(prevDate, 'yyyy-MM-dd')

      cumulative += dailyTotals[dayStr] || 0
      prevCumulative += dailyPrevTotals[prevDayStr] || 0

      return {
        day: i + 1,
        current: cumulative,
        previous: prevCumulative,
      }
    })

    const heatmapGrid: Record<string, number> = {}
    let maxHeatmapCount = 0

    currentExpenses.forEach((tx) => {
      const txDate = new Date(tx.created_at)
      const dayOfWeek = txDate.getDay()
      const hour = txDate.getHours()
      let timeSlot = 3
      if (hour >= 6 && hour < 12) timeSlot = 0
      else if (hour >= 12 && hour < 18) timeSlot = 1
      else if (hour >= 18 && hour < 21) timeSlot = 2

      const key = `${dayOfWeek}-${timeSlot}`
      heatmapGrid[key] = (heatmapGrid[key] || 0) + 1
      maxHeatmapCount = Math.max(maxHeatmapCount, heatmapGrid[key])
    })

    const heatmapData = Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 4 }, (_, hour) => {
        const key = `${day}-${hour}`
        const count = heatmapGrid[key] || 0
        const total = currentExpenses
          .filter((tx) => {
            const txDate = new Date(tx.created_at)
            const dayOfWeek = txDate.getDay()
            const txHour = txDate.getHours()
            let timeSlot = 3
            if (txHour >= 6 && txHour < 12) timeSlot = 0
            else if (txHour >= 12 && txHour < 18) timeSlot = 1
            else if (txHour >= 18 && txHour < 21) timeSlot = 2
            return dayOfWeek === day && timeSlot === hour
          })
          .reduce((acc, tx) => acc + Number(tx.amount), 0)
        return { day, hour, count, total }
      }),
    ).flat()

    const hourlyGrid: Record<number, { count: number; total: number }> = {}
    for (let h = 0; h < 24; h++) {
      hourlyGrid[h] = { count: 0, total: 0 }
    }

    currentExpenses.forEach((tx) => {
      const hour = new Date(tx.created_at).getHours()
      hourlyGrid[hour].count += 1
      hourlyGrid[hour].total += Number(tx.amount)
    })

    const hourlyData = Object.entries(hourlyGrid).map(([hour, data]) => ({
      hour: `${hour}:00`,
      count: data.count,
      total: data.total,
    }))

    const moneyFlowData = {
      categories: expensesData.map((cat) => ({
        name: cat.name,
        value: cat.value,
        percentage: totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0,
      })),
    }

    const top5 = [...currentExpenses]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5)
      .map((tx) => ({
        description: tx.description || capitalize(tx.categories?.name || 'Sin descripción'),
        category: capitalize(tx.categories?.name || 'Otros'),
        amount: Number(tx.amount),
        date: format(new Date(tx.created_at), 'd MMM', {}),
      }))

    const treemapData = expensesData.map(({ name, value }) => ({
      name,
      size: value,
      pct: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
    }))

    const prevExpensesByCategory = prevExpenses.reduce<Record<string, number>>((acc, tx) => {
      const categoryName = tx.categories?.name
      if (!categoryName) return acc
      const normalizedName = capitalize(categoryName)
      acc[normalizedName] = (acc[normalizedName] || 0) + Number(tx.amount)
      return acc
    }, {})

    const allCategoryNames = Array.from(
      new Set([...expensesData.map((cat) => cat.name), ...Object.keys(prevExpensesByCategory)]),
    )

    const momData = allCategoryNames.map((category) => {
      const current = expensesData.find((cat) => cat.name === category)?.value || 0
      const previous = prevExpensesByCategory[category] || 0
      const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0

      return {
        category,
        current,
        previous,
        change,
      }
    })

    return NextResponse.json({
      totalExpenses,
      totalIncome,
      prevTotalExpenses,
      prevTotalIncome,
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
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 },
    )
  }
}
