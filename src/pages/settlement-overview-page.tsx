import { WalletCards } from 'lucide-react'

import { NoTripPage } from '@/components/trip/no-trip-page'

export function SettlementOverviewPage() {
  return (
    <NoTripPage
      title="結算"
      subtitle="查看結算結果"
      emptyTitle="還沒有可結算的旅程"
      emptyDescription="先建立旅程並開始記帳，之後結算結果才會出現在這裡。"
      icon={<WalletCards className="h-6 w-6" />}
      resolveTripRoute={(tripId) => `/trip/${tripId}/settlement`}
    />
  )
}
