import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { AuthSignInPage } from '@/pages/auth-sign-in-page'
import { AuthSignUpPage } from '@/pages/auth-sign-up-page'
import { ContributionCreatePage } from '@/pages/contribution-create-page'
import { ExpenseCreatePage } from '@/pages/expense-create-page'
import { HomeEntryPage } from '@/pages/home-entry-page'
import { InvitationAcceptPage } from '@/pages/invitation-accept-page'
import { MembersPage } from '@/pages/members-page'
import { RecordCreateOverviewPage } from '@/pages/record-create-overview-page'
import { SettlementPage } from '@/pages/settlement-page'
import { SettlementOverviewPage } from '@/pages/settlement-overview-page'
import { TripCreatePage } from '@/pages/trip-create-page'
import { TripDetailPage } from '@/pages/trip-detail-page'
import { TripDetailOverviewPage } from '@/pages/trip-detail-overview-page'
import { TripManagePage } from '@/pages/trip-manage-page'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeEntryPage />} />
        <Route path="/login" element={<AuthSignInPage />} />
        <Route path="/register" element={<AuthSignUpPage />} />
        <Route path="/invitations/:token" element={<InvitationAcceptPage />} />
        <Route path="/details" element={<TripDetailOverviewPage />} />
        <Route path="/new-record" element={<RecordCreateOverviewPage />} />
        <Route path="/settlement" element={<SettlementOverviewPage />} />
        <Route path="/trip/new" element={<TripCreatePage />} />
        <Route path="/trip/:tripId/edit" element={<TripCreatePage />} />
        <Route path="/trip/:tripId" element={<TripDetailPage />} />
        <Route path="/trip/:tripId/manage" element={<TripManagePage />} />
        <Route path="/trip/:tripId/members" element={<MembersPage />} />
        <Route path="/trip/:tripId/new-expense" element={<ExpenseCreatePage />} />
        <Route path="/trip/:tripId/new-contribution" element={<ContributionCreatePage />} />
        <Route path="/trip/:tripId/settlement" element={<SettlementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
