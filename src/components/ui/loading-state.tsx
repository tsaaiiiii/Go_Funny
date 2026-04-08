import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoadingStateProps {
  title?: string
  description?: string
  className?: string
  compact?: boolean
}

export function LoadingState({
  title = '載入中',
  description = '正在整理目前畫面需要的資料。',
  className,
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        compact ? 'min-h-[160px]' : 'min-h-[50vh]',
        className,
      )}
    >
      <div className="w-full max-w-sm rounded-[28px] border border-[#D6E6E9] bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] px-5 py-6 text-center shadow-float">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF7F8] text-primary">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
