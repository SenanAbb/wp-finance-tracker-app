"use client"

import { Search, X } from "lucide-react"
import { Tag } from "@/components/ui/tag"

interface TransactionFiltersProps {
  categories: string[]
  accounts: string[]
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedType: string
  onTypeChange: (type: string) => void
  selectedAccount: string
  onAccountChange: (account: string) => void
  selectedCategories: Set<string>
  onCategoryToggle: (category: string) => void
  onClearFilters: () => void
  onApplyFilters?: () => void
}

export function TransactionFilters({
  categories,
  accounts,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedAccount,
  onAccountChange,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  onApplyFilters,
}: TransactionFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategories.size > 0 || selectedType || selectedAccount

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar descripción..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface text-foreground placeholder-muted-foreground text-sm"
        />
      </div>

      {/* Type and Account filters in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Type filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm"
          >
            <option value="">Todos</option>
            <option value="expense">Gastos</option>
            <option value="income">Ingresos</option>
          </select>
        </div>

        {/* Account filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Cuenta</label>
          <select
            value={selectedAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-foreground text-sm"
          >
            <option value="">Todas</option>
            {accounts.map((account) => (
              <option key={account} value={account}>
                {account}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category multi-select with tags */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Categorías</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Tag
              key={category}
              label={category}
              selected={selectedCategories.has(category)}
              onToggle={() => onCategoryToggle(category)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onApplyFilters}
          className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Aplicar
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors"
            title="Limpiar filtros"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
