import { Navigate } from 'react-router-dom'

import { authClient } from '@/lib/auth-client'
import { readMockSession } from '@/lib/mock-session'
import { TripsPage } from '@/pages/trips-page'

export function HomeEntryPage() {
  const { data: session, isPending } = authClient.useSession()
  const mockSession = readMockSession()
  const currentUser = session?.user ?? mockSession?.user

  if (isPending && !mockSession) {
    return null
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return <TripsPage />
}
