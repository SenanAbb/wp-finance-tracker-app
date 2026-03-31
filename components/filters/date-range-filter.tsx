"use client"

import { useCallback, useState } from "react"
import { CalendarDays } from "lucide-react"
import { getDateRangeFromParams, type DateRange } from "@/lib/date-range"

const PRESETS = [
  { label: "Esta semana", value: "week" },
  { label: "Este mes", value: "month" },
  { label: "Mes anterior", value: "prev_month" },
  { label: "Últimos 3 meses", value: "3months" },
  { label: "Últimos 6 meses", value: "6months" },
  { label: "Este año", value: "year" },
] as const

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0]
}

interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void
  initialPreset?: string
}

export function DateRangeFilter({ onDateRangeChange, initialPreset = "month" }: DateRangeFilterProps) {
  const [currentPreset, setCurrentPreset] = useState(initialPreset)
  const [isCustomMode, setIsCustomMode] = useState(initialPreset === "custom")
  
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
  const [tempFrom, setTempFrom] = useState(formatDate(defaultFrom))
  const [tempTo, setTempTo] = useState(formatDate(now))

  const handlePreset = useCallback((value: string) => {
    setCurrentPreset(value)
    
    if (value === "custom") {
      setIsCustomMode(true)
      setTempFrom(formatDate(defaultFrom))
      setTempTo(formatDate(now))
    } else {
      setIsCustomMode(false)
      const range = getDateRangeFromParams({ preset: value })
      onDateRangeChange(range)
    }
  }, [onDateRangeChange, defaultFrom, now])

  const handleApplyCustom = useCallback(() => {
    const range = getDateRangeFromParams({ 
      preset: "custom", 
      from: tempFrom, 
      to: tempTo 
    })
    onDateRangeChange(range)
  }, [tempFrom, tempTo, onDateRangeChange])

  const handleCustomDateChange = (key: "from" | "to", value: string) => {
    if (key === "from") setTempFrom(value)
    else setTempTo(value)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarDays className="w-4 h-4 text-muted-foreground" />
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handlePreset(preset.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentPreset === preset.value
              ? "bg-primary text-primary-foreground"
              : "bg-surface border border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          {preset.label}
        </button>
      ))}
      <button
        onClick={() => handlePreset("custom")}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          currentPreset === "custom"
            ? "bg-primary text-primary-foreground"
            : "bg-surface border border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        }`}
      >
        Personalizado
      </button>

      {isCustomMode && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={tempFrom}
            onChange={(e) => handleCustomDateChange("from", e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs border border-border bg-surface text-foreground"
          />
          <span className="text-xs text-muted-foreground">a</span>
          <input
            type="date"
            value={tempTo}
            onChange={(e) => handleCustomDateChange("to", e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs border border-border bg-surface text-foreground"
          />
          <button
            onClick={handleApplyCustom}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
