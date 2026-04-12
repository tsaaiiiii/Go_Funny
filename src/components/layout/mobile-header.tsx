import type { ReactNode } from 'react'
import { ChevronLeft, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  title: ReactNode
  subtitle?: string
  location?: string
  backTo?: string
  className?: string
}

export function MobileHeader({ title, subtitle, location, backTo, className }: MobileHeaderProps) {
  return (
    <header className={cn('flex items-start gap-3', className)}>
      {backTo ? (
        <Link
          to={backTo}
          className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-card/90 text-foreground shadow-soft"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        {typeof title === 'string' ? (
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-foreground">{title}</h1>
        ) : (
          <div className="mt-1">{title}</div>
        )}
        {location ? (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        ) : null}
      </div>
    </header>
  )
}
