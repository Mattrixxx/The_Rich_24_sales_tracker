"use client"

import * as React from "react"
import { CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface YearPickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minYear?: number
  maxYear?: number
}

export function YearPicker({
  date,
  onDateChange,
  placeholder = "เลือกปี",
  className,
  disabled = false,
  minYear = 2020,
  maxYear = 2030,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false)

  const years = React.useMemo(() => {
    const result = []
    for (let year = minYear; year <= maxYear; year++) {
      result.push(year)
    }
    return result
  }, [minYear, maxYear])

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, 0, 1)
    onDateChange(newDate)
    setOpen(false)
  }

  const currentYear = date?.getFullYear()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {date ? `ปี ${date.getFullYear() + 543}` : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={currentYear === year ? "default" : "ghost"}
              size="sm"
              className="h-9"
              onClick={() => handleYearSelect(year)}
            >
              {year + 543}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
