import { LoaderCircle } from 'lucide-react'

interface PageBlockingLoadingProps {
  title?: string
  description?: string
}

export function PageBlockingLoading({
  title = '處理中',
  description = '正在更新資料，請稍候。',
}: PageBlockingLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(247,244,238,0.72)] px-4 backdrop-blur-[3px]">
      <div className="w-full max-w-sm rounded-[28px] border border-[#D6E6E9] bg-[linear-gradient(180deg,rgba(255,253,252,0.98),rgba(240,247,246,0.96))] px-5 py-6 text-center shadow-float">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF7F8] text-primary">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
