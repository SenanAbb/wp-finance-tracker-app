export type DatePreset = "week" | "month" | "prev_month" | "3months" | "6months" | "year" | "custom"

export interface DateRange {
  from: Date
  to: Date
  preset: DatePreset
}

export function getDateRangeFromParams(params: { preset?: string; from?: string; to?: string }): DateRange {
  const now = new Date()
  const preset = (params.preset || "month") as DatePreset

  switch (preset) {
    case "week": {
      const dayOfWeek = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
      monday.setHours(0, 0, 0, 0)
      return { from: monday, to: now, preset }
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: now, preset }
    }
    case "prev_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { from, to, preset }
    }
    case "3months": {
      const from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return { from, to: now, preset }
    }
    case "6months": {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      return { from, to: now, preset }
    }
    case "year": {
      const from = new Date(now.getFullYear(), 0, 1)
      return { from, to: now, preset }
    }
    case "custom": {
      const from = params.from ? new Date(params.from) : new Date(now.getFullYear(), now.getMonth(), 1)
      const to = params.to ? new Date(params.to) : now
      return { from, to, preset }
    }
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: now, preset: "month" }
    }
  }
}
