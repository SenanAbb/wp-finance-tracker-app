import { useState, useCallback } from "react"

export interface TransactionFiltersState {
  searchTerm: string
  selectedCategories: Set<string>
  selectedType: string
  selectedAccount: string
}

export function useTransactionFilters() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState("")
  const [selectedAccount, setSelectedAccount] = useState("")

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const setCategories = useCallback((categories: Set<string>) => {
    setSelectedCategories(categories)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategories(new Set())
    setSelectedType("")
    setSelectedAccount("")
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    toggleCategory,
    setCategories,
    selectedType,
    setSelectedType,
    selectedAccount,
    setSelectedAccount,
    clearFilters,
  }
}
