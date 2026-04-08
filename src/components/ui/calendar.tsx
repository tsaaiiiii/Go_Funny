import { ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { zhTW } from 'date-fns/locale'

import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={zhTW}
      navLayout="around"
      className={cn('p-1', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-y-4',
        month_caption: 'col-start-2 flex h-11 items-center justify-center',
        caption_label: 'text-base font-semibold text-foreground',
        nav: 'absolute inset-x-0 top-0 flex h-11 items-center justify-between',
        button_previous:
          'col-start-1 row-start-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E7EA] bg-white text-foreground transition-colors hover:bg-[#F6FBFC]',
        button_next:
          'col-start-3 row-start-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D7E7EA] bg-white text-foreground transition-colors hover:bg-[#F6FBFC]',
        month_grid: 'col-span-3 w-full border-collapse',
        weekdays: 'grid grid-cols-7 gap-1',
        weekday: 'h-9 text-center text-xs font-medium text-muted-foreground',
        week: 'mt-1 grid grid-cols-7 gap-1',
        day: 'flex h-11 w-11 items-center justify-center p-0',
        day_button:
          'flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-medium text-foreground transition-colors hover:bg-[#F6FBFC]',
        today: 'bg-[#EEF7F8] text-primary',
        outside: 'text-muted-foreground/45',
        disabled: 'text-muted-foreground/35',
        hidden: 'invisible',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        range_start:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-2xl',
        range_end:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-2xl',
        range_middle: 'bg-[#EAF4F6] text-foreground rounded-none',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? <ChevronLeft className="h-4 w-4" {...iconProps} /> : <ChevronRight className="h-4 w-4" {...iconProps} />,
      }}
      {...props}
    />
  )
}
