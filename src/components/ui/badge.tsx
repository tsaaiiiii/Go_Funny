import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'blue' | 'green' | 'warning'
}

const toneMap = {
  default: 'bg-muted text-muted-foreground',
  blue: 'bg-[#DCEEF2] text-[#3D7C8A]',
  green: 'bg-[#E3EEE5] text-[#5F876A]',
  warning: 'bg-[#F4E7D4] text-[#A9752A]',
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        toneMap[tone],
        className,
      )}
      {...props}
    />
  )
}
