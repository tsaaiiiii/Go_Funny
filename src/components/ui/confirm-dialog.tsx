import { LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  tone?: 'default' | 'danger'
  loading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

const toneStyles: Record<NonNullable<ConfirmDialogProps['tone']>, string> = {
  default:
    'bg-primary text-primary-foreground shadow-soft hover:bg-[#4E99A9]',
  danger:
    'bg-[#C96B6B] text-white shadow-soft hover:bg-[#B95A5A]',
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '確認',
  cancelText = '取消',
  tone = 'default',
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,40,44,0.32)] px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-[28px] border border-[#D6E6E9] bg-[linear-gradient(180deg,rgba(255,253,252,0.98),rgba(240,247,246,0.96))] px-5 py-6 shadow-float">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description ? (
          <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
        ) : null}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-card font-medium text-foreground transition-colors hover:bg-white disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-70',
              toneStyles[tone],
            )}
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
