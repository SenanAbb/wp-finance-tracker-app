import { useState, useCallback, useEffect } from "react"
import { getDateRangeFromParams, type DateRange } from "@/lib/date-range"

export function useDateRangeFilter() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null)

  // Initialize date range on mount
  useEffect(() => {
    const initialRange = getDateRangeFromParams({ preset: "month" })
    setDateRange(initialRange)
  }, [])

  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range)
  }, [])

  return {
    dateRange,
    setDateRange,
    handleDateRangeChange,
  }
}
