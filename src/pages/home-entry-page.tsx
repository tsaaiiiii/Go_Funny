import { Navigate } from 'react-router-dom'

import { authClient } from '@/lib/auth-client'
import { LoadingState } from '@/components/ui/loading-state'
import { readMockSession } from '@/lib/mock-session'
import { TripsPage } from '@/pages/trips-page'

export function HomeEntryPage() {
  const { data: session, isPending } = authClient.useSession()
  const mockSession = readMockSession()
  const currentUser = session?.user ?? mockSession?.user

  if (isPending && !mockSession) {
    return <LoadingState title="正在進入首頁" description="正在準備你的帳號與首頁內容。" />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <TripsPage sessionUser={session?.user ?? null} />
}
