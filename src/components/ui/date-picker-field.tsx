import { format, parseISO } from 'date-fns'
import { CalendarRange } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerFieldProps {
  value: string
  onChange: (value: string) => void
  accent?: 'primary' | 'secondary'
  helperText?: string
}

const accentStyles = {
  primary: {
    border: 'hover:border-[#BFD8DE]',
    icon: 'text-primary',
    badge: 'bg-[#EEF7F8] text-primary',
    selected:
      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
    today: 'bg-[#EEF7F8] text-primary',
  },
  secondary: {
    border: 'hover:border-[#C9DEC9]',
    icon: 'text-secondary',
    badge: 'bg-[#F3F8F4] text-secondary',
    selected:
      'bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground',
    today: 'bg-[#F3F8F4] text-secondary',
  },
} as const

const formatDateLabel = (value: string) => {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${value}T00:00:00`))
}

export function DatePickerField({
  value,
  onChange,
  accent = 'primary',
  helperText = '選擇日期',
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => parseISO(value))
  const selectedDate = useMemo(() => parseISO(value), [value])
  const styles = accentStyles[accent]

  useEffect(() => {
    if (open) {
      setMonth(selectedDate)
    }
  }, [open, selectedDate])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full rounded-[24px] border border-[#D6E6E9] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,249,249,0.95))] p-2 text-left shadow-[0_12px_32px_rgba(118,157,167,0.08)] transition-colors',
            styles.border,
          )}
        >
          <div className="rounded-[18px] bg-[#F8FCFC] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#6A919B]">Date</p>
                <p className="mt-1 truncate text-[15px] font-semibold text-foreground">{formatDateLabel(value)}</p>
              </div>
              <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-soft', styles.icon)}>
                <CalendarRange className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-[18px] bg-white/70 px-4 py-3 text-sm text-muted-foreground">
            <span>{helperText}</span>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', styles.badge)}>
              {format(selectedDate, 'MM/dd')}
            </span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[min(100vw-2rem,24rem)] rounded-[28px] border-[#D6E6E9] p-3">
        <div className="mb-3 rounded-[20px] bg-[#F7FBFC] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-[#6A919B]">Date</p>
          <p className="mt-1 text-sm font-medium text-foreground">{helperText}</p>
        </div>

        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          onSelect={(nextDate) => {
            if (!nextDate) return
            onChange(format(nextDate, 'yyyy-MM-dd'))
            setOpen(false)
          }}
          defaultMonth={selectedDate}
          className="rounded-[24px] bg-white"
          classNames={{
            selected: styles.selected,
            today: styles.today,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
