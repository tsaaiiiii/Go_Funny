import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'

type ToastTone = 'success' | 'error' | 'info'

type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
  duration?: number
}

type ToastItem = ToastInput & {
  id: number
  tone: ToastTone
  duration: number
}

type ToastContextValue = {
  showToast: (toast: ToastInput) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
}

const flashStorageKey = 'app-flash-toast'
const flashToastTtl = 5_000

type FlashToastEnvelope = ToastInput & { createdAt: number }

const ToastContext = createContext<ToastContextValue | null>(null)

const toneConfig: Record<
  ToastTone,
  {
    icon: typeof CheckCircle2
    className: string
    iconClassName: string
  }
> = {
  success: {
    icon: CheckCircle2,
    className:
      'border-[#B9DEC8] bg-[linear-gradient(135deg,rgba(247,253,249,0.98),rgba(232,245,236,0.98))] text-[#235B39]',
    iconClassName: 'text-[#3C8F67]',
  },
  error: {
    icon: AlertCircle,
    className:
      'border-[#EDCDCD] bg-[linear-gradient(135deg,rgba(255,249,249,0.98),rgba(252,236,236,0.98))] text-[#7B3434]',
    iconClassName: 'text-[#C25757]',
  },
  info: {
    icon: Info,
    className:
      'border-[#CFE2E8] bg-[linear-gradient(135deg,rgba(248,252,253,0.98),rgba(235,245,248,0.98))] text-[#315966]',
    iconClassName: 'text-[#5A97A8]',
  },
}

const readFlashToast = (): ToastInput | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.sessionStorage.getItem(flashStorageKey)

  if (!raw) {
    return null
  }

  window.sessionStorage.removeItem(flashStorageKey)

  try {
    const envelope = JSON.parse(raw) as FlashToastEnvelope
    if (typeof envelope.createdAt !== 'number' || Date.now() - envelope.createdAt > flashToastTtl) {
      return null
    }
    const { createdAt: _createdAt, ...toast } = envelope
    return toast
  } catch {
    return null
  }
}

export const queueFlashToast = (toast: ToastInput) => {
  if (typeof window === 'undefined') {
    return
  }

  const envelope: FlashToastEnvelope = { ...toast, createdAt: Date.now() }
  window.sessionStorage.setItem(flashStorageKey, JSON.stringify(envelope))
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const location = useLocation()

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((toast: ToastInput) => {
    const nextToast: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      tone: toast.tone ?? 'info',
      duration: toast.duration ?? 3200,
      ...toast,
    }

    setToasts((current) => [...current, nextToast])
  }, [])

  useEffect(() => {
    const flashToast = readFlashToast()

    if (flashToast) {
      showToast(flashToast)
    }
  }, [showToast, location.pathname, location.search])

  useEffect(() => {
    if (toasts.length === 0) {
      return
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), toast.duration),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dismissToast, toasts])

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showSuccess: (title, description) =>
        showToast({ title, description, tone: 'success' }),
      showError: (title, description) =>
        showToast({ title, description, tone: 'error' }),
      showInfo: (title, description) =>
        showToast({ title, description, tone: 'info' }),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:top-6">
        {toasts.map((toast) => {
          const config = toneConfig[toast.tone]
          const Icon = config.icon

          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto w-full max-w-sm rounded-[24px] border px-4 py-3 shadow-[0_18px_40px_rgba(89,122,130,0.16)] backdrop-blur-xl',
                config.className,
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-0.5 shrink-0', config.iconClassName)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-5 opacity-80">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="關閉通知"
                  onClick={() => dismissToast(toast.id)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white/60 text-current transition-colors hover:bg-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}
