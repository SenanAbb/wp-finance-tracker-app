'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/ui/kpi-card';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { TransactionFiltersContainer } from '@/components/filters/transaction-filters-container';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ReceiptText,
  TrendingDown,
} from 'lucide-react';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { usePagination } from '@/hooks/usePagination';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmt = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
    v,
  );

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  categories: { name: string } | null;
  accounts: { name: string } | null;
}

export default function TransactionsPage() {
  // Custom hooks for state management
  const { dateRange, handleDateRangeChange } = useDateRangeFilter();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    selectedType,
    setSelectedType,
    selectedAccount,
    setSelectedAccount,
    clearFilters,
  } = useTransactionFilters();
  const {
    currentPage,
    pageSize,
    changePageSize,
    prevPage,
    nextPage,
    goToPage,
  } = usePagination(10);

  // Data state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [kpis, setKpis] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    count: 0,
    avgExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch categories and accounts once
  useEffect(() => {
    const fetchMetadata = async () => {
      const [catsRes, acctsRes] = await Promise.all([
        supabase.from('categories').select('name').order('name'),
        supabase
          .from('accounts')
          .select('name')
          .is('archived_at', null)
          .order('name'),
      ]);

      setCategories(catsRes.data?.map((c) => capitalize(c.name)) || []);
      setAccounts(acctsRes.data?.map((a) => a.name) || []);
    };

    fetchMetadata();
  }, []);

  // Fetch all transactions for date range
  useEffect(() => {
    if (!dateRange) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select(
            `id, amount, type, description, created_at, categories (name), accounts (name)`,
          )
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString())
          .order('created_at', { ascending: false });

        const txArray = (txData as unknown as Transaction[]) || [];
        setAllTransactions(txArray);
        setFilteredTransactions(txArray);
        goToPage(1);

        // Calculate initial KPIs
        const expenses = txArray
          .filter((tx) => tx.type === 'expense')
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        const income = txArray
          .filter((tx) => tx.type === 'income')
          .reduce((acc, tx) => acc + Number(tx.amount), 0);
        const expenseCount = txArray.filter(
          (tx) => tx.type === 'expense',
        ).length;

        setKpis({
          totalExpenses: expenses,
          totalIncome: income,
          count: txArray.length,
          avgExpense: expenseCount > 0 ? expenses / expenseCount : 0,
        });
        setTotal(txArray.length);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Handle Apply button click - filter transactions in memory
  const handleApplyFilters = useCallback(() => {
    let filtered = allTransactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((tx) =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter((tx) => tx.type === selectedType);
    }

    // Apply account filter
    if (selectedAccount) {
      filtered = filtered.filter((tx) => tx.accounts?.name === selectedAccount);
    }

    // Apply category filter (multi-select)
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((tx) => {
        const categoryName = tx.categories?.name;
        if (!categoryName) return false;
        // Convert selected categories to lowercase for comparison
        const selectedCategoriesLower = Array.from(selectedCategories).map(
          (c) => c.toLowerCase(),
        );
        return selectedCategoriesLower.includes(categoryName.toLowerCase());
      });
    }

    setFilteredTransactions(filtered);
    setTotal(filtered.length);
    goToPage(1);

    // Calculate KPIs
    const expenses = filtered
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + Number(tx.amount), 0);
    const income = filtered
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + Number(tx.amount), 0);
    const expenseCount = filtered.filter((tx) => tx.type === 'expense').length;

    setKpis({
      totalExpenses: expenses,
      totalIncome: income,
      count: filtered.length,
      avgExpense: expenseCount > 0 ? expenses / expenseCount : 0,
    });
  }, [
    allTransactions,
    searchTerm,
    selectedType,
    selectedAccount,
    selectedCategories,
    goToPage,
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const offset = (currentPage - 1) * pageSize;

  // Paginate filtered transactions
  const paginatedTransactions = filteredTransactions.slice(
    offset,
    offset + pageSize,
  );

  // Group transactions by day
  const groupedByDay: Record<string, Transaction[]> = {};
  paginatedTransactions.forEach((tx) => {
    const dayKey = format(new Date(tx.created_at), 'yyyy-MM-dd');
    if (!groupedByDay[dayKey]) {
      groupedByDay[dayKey] = [];
    }
    groupedByDay[dayKey].push(tx);
  });

  const sortedDays = Object.keys(groupedByDay).sort().reverse();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="px-2 md:px-0">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-1 md:mb-2">
            Transacciones
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Vista detallada de todos tus movimientos financieros.
          </p>
        </div>

        {/* Sticky Date Filter */}
        {dateRange && (
          <div className="sticky top-0 z-30 bg-background border-b border-border px-2 md:px-0 py-3 md:py-4 -mx-2 md:mx-0 md:border-0">
            <DateRangeFilter
              onDateRangeChange={handleDateRangeChange}
              initialPreset="month"
            />
          </div>
        )}

        {/* Collapsible Advanced Filters */}
        <TransactionFiltersContainer
          categories={categories}
          accounts={accounts}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
          selectedCategories={selectedCategories}
          onCategoryToggle={toggleCategory}
          onClearFilters={clearFilters}
          onApplyFilters={handleApplyFilters}
        />

        {/* KPI cards - Responsive grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4 px-2 md:px-0">
          <KPICard
            icon={ArrowDownIcon}
            label="Total Gastos"
            shortLabel="Gastos"
            value={fmt(kpis.totalExpenses)}
          />
          <KPICard
            icon={ArrowUpIcon}
            label="Total Ingresos"
            shortLabel="Ingresos"
            value={fmt(kpis.totalIncome)}
            className="text-primary"
          />
          <KPICard
            icon={ReceiptText}
            label="Nº Transacciones"
            shortLabel="Nº Tx"
            value={total}
          />
          <KPICard
            icon={TrendingDown}
            label="Media/Gasto"
            shortLabel="Media"
            value={fmt(kpis.avgExpense)}
          />
        </div>

        {/* Transactions Table */}
        <Card className="px-2 md:px-0">
          <CardHeader className="px-3 md:px-6 py-3 md:py-4">
            <CardTitle className="text-lg md:text-xl">
              {total} transacciones
              {dateRange && (
                <span className="text-xs md:text-sm font-normal text-muted-foreground ml-2 block md:inline">
                  {format(dateRange.from, 'd MMM yyyy', { locale: es })} —{' '}
                  {format(dateRange.to, 'd MMM yyyy', { locale: es })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 md:px-6 py-0 md:py-4">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Cargando transacciones...
              </div>
            ) : sortedDays.length > 0 ? (
              <>
                <div className="relative w-full overflow-x-auto">
                  <table className="w-full caption-bottom text-xs md:text-sm">
                    <thead className="[&_tr]:border-b bg-muted/30 sticky top-0">
                      <tr className="border-b transition-colors">
                        <th className="h-10 md:h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground">
                          Fecha
                        </th>
                        <th className="h-10 md:h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                          Descripción
                        </th>
                        <th className="h-10 md:h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                          Categoría
                        </th>
                        <th className="h-10 md:h-12 px-2 md:px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">
                          Cuenta
                        </th>
                        <th className="h-10 md:h-12 px-2 md:px-4 text-right align-middle font-medium text-muted-foreground">
                          Importe
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {sortedDays
                        .map((dayKey) => {
                          const dayTxs = groupedByDay[dayKey];
                          const dayDate = new Date(dayKey);
                          const dayExpenses = dayTxs
                            .filter((tx) => tx.type === 'expense')
                            .reduce((acc, tx) => acc + Number(tx.amount), 0);
                          const dayIncome = dayTxs
                            .filter((tx) => tx.type === 'income')
                            .reduce((acc, tx) => acc + Number(tx.amount), 0);
                          const dayTotal = dayIncome - dayExpenses;

                          return (
                            <tr
                              key={dayKey}
                              className="bg-muted/20 hover:bg-muted/30"
                            >
                              <td
                                colSpan={5}
                                className="p-2 md:p-3 font-semibold text-xs md:text-sm"
                              >
                                {format(dayDate, "EEEE, d 'de' MMMM", {
                                  locale: es,
                                })}
                                <span className="text-muted-foreground font-normal ml-2 text-xs">
                                  Gastos: {fmt(dayExpenses)} | Ingresos:{' '}
                                  {fmt(dayIncome)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                        .flatMap((dayHeader, dayIndex) => {
                          const dayKey = sortedDays[dayIndex];
                          const dayTxs = groupedByDay[dayKey];
                          return [
                            dayHeader,
                            ...dayTxs.map((tx) => {
                              const categoryData = tx.categories;
                              const accountData = tx.accounts;

                              return (
                                <tr
                                  key={tx.id}
                                  className="border-b transition-colors hover:bg-surface-hover"
                                >
                                  <td className="p-2 md:p-4 align-middle text-muted-foreground text-xs md:text-sm">
                                    {format(new Date(tx.created_at), 'HH:mm')}
                                  </td>
                                  <td className="p-2 md:p-4 align-middle font-medium text-xs md:text-sm hidden sm:table-cell">
                                    {tx.description ||
                                      capitalize(
                                        categoryData?.name || 'Sin desc.',
                                      )}
                                  </td>
                                  <td className="p-2 md:p-4 align-middle hidden md:table-cell">
                                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                                      {capitalize(
                                        categoryData?.name || 'Otros',
                                      )}
                                    </span>
                                  </td>
                                  <td className="p-2 md:p-4 align-middle text-muted-foreground text-xs hidden lg:table-cell">
                                    {accountData?.name || 'Desconocida'}
                                  </td>
                                  <td
                                    className={cn(
                                      'p-2 md:p-4 align-middle text-right font-medium text-xs md:text-sm',
                                      tx.type === 'expense'
                                        ? 'text-foreground'
                                        : 'text-primary',
                                    )}
                                  >
                                    {tx.type === 'expense' ? '-' : '+'}
                                    {fmt(Number(tx.amount))}
                                  </td>
                                </tr>
                              );
                            }),
                          ];
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border px-2 md:px-0">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Mostrando {offset + 1} a{' '}
                      {Math.min(offset + pageSize, total)} de {total}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => prevPage()}
                        disabled={currentPage === 1}
                        className="px-2 md:px-3 py-1 md:py-1.5 rounded text-xs border border-border hover:bg-surface-hover disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          changePageSize(parseInt(e.target.value))
                        }
                        className="px-2 py-1 rounded text-xs border border-border bg-surface"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                      <button
                        onClick={() => nextPage()}
                        disabled={currentPage === totalPages}
                        className="px-2 md:px-3 py-1 md:py-1.5 rounded text-xs border border-border hover:bg-surface-hover disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No se encontraron transacciones en este período.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
