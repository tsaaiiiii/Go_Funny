import { PlusCircle } from 'lucide-react'

import { NoTripPage } from '@/components/trip/no-trip-page'

export function RecordCreateOverviewPage() {
  return (
    <NoTripPage
      title="新增"
      subtitle="新增記帳內容"
      emptyTitle="還沒有可新增記錄的旅程"
      emptyDescription="先建立旅程，之後才能新增支出或公積金存入。"
      icon={<PlusCircle className="h-6 w-6" />}
      resolveTripRoute={(tripId) => `/trip/${tripId}/new-expense`}
    />
  )
}
