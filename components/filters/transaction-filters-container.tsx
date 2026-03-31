"use client"

import { ChevronDown } from "lucide-react"
import { TransactionFilters } from "./transaction-filters"
import { useState } from "react"

interface TransactionFiltersContainerProps {
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

export function TransactionFiltersContainer({
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
}: TransactionFiltersContainerProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="px-2 md:px-0">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        {showFilters ? "Ocultar filtros" : "Mostrar filtros avanzados"}
      </button>
      {showFilters && (
        <div className="mb-4 p-4 rounded-lg border border-border bg-surface/50">
          <TransactionFilters
            categories={categories}
            accounts={accounts}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            selectedAccount={selectedAccount}
            onAccountChange={onAccountChange}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            onClearFilters={onClearFilters}
            onApplyFilters={onApplyFilters}
          />
        </div>
      )}
    </div>
  )
}
