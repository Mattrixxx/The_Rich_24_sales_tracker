"use client"

import * as React from "react"
import { th } from "date-fns/locale"
import { CalendarIcon, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthPickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const months = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
]

export function MonthPicker({
  date,
  onDateChange,
  placeholder = "เลือกเดือน",
  className,
  disabled = false,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewYear, setViewYear] = React.useState(date?.getFullYear() || new Date().getFullYear())

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1)
    onDateChange(newDate)
    setOpen(false)
  }

  const currentMonth = date?.getMonth()
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
            {date ? `${months[date.getMonth()]} ${date.getFullYear() + 543}` : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          {/* Year selector */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewYear(viewYear - 1)}
            >
              ←
            </Button>
            <span className="font-semibold">{viewYear + 543}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewYear(viewYear + 1)}
            >
              →
            </Button>
          </div>
          
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={currentMonth === index && currentYear === viewYear ? "default" : "ghost"}
                size="sm"
                className="h-9"
                onClick={() => handleMonthSelect(index)}
              >
                {month.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
