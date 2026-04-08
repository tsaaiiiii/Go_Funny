import { ReceiptText } from 'lucide-react'

import { NoTripPage } from '@/components/trip/no-trip-page'

export function TripDetailOverviewPage() {
  return (
    <NoTripPage
      title="明細"
      subtitle="旅程明細"
      emptyTitle="還沒有可查看的明細"
      emptyDescription="建立旅程後，支出、公積金與每日記帳內容都會整理在這裡。"
      icon={<ReceiptText className="h-6 w-6" />}
      resolveTripRoute={(tripId) => `/trip/${tripId}`}
    />
  )
}
