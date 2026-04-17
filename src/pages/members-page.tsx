import { AlertTriangle, Copy, LoaderCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'
import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { PageBlockingLoading } from '@/components/ui/page-blocking-loading'
import { SectionHeading } from '@/components/ui/section-heading'
import { useToast } from '@/components/ui/toast'
import { useGetTripById } from '@/api/generated/trips/trips'
import { useDeleteTripMember } from '@/api/generated/members/members'
import { useCreateTripInvitation } from '@/api/generated/invitations/invitations'
import { hasStatus } from '@/lib/api-response'
import { readMockSession } from '@/lib/mock-session'

export function MembersPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { showError, showSuccess } = useToast()
  const { data: session } = authClient.useSession()
  const mockSession = readMockSession()
  const currentUser = session?.user ?? mockSession?.user ?? null
  const { data: tripResponse, isPending } = useGetTripById(tripId!)
  const trip = hasStatus(tripResponse, 200) ? tripResponse.data : null
  const deleteMemberMutation = useDeleteTripMember()
  const createInvitationMutation = useCreateTripInvitation()
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [deleteMemberFlowPending, setDeleteMemberFlowPending] = useState(false)

  if (isPending) {
    return <LoadingState title="成員資料載入中" description="正在整理旅伴名單與邀請資訊。" />
  }

  if (!trip) {
    return <LoadingState title="找不到旅程資料" description="請稍後重試，或回首頁重新選擇旅程。" compact />
  }

  const currentTrip = trip
  const isTripOwner = Boolean(currentUser?.id && currentTrip.createdByUserId === currentUser.id)
  const backTo = searchParams.get('from') === 'create' ? '/' : `/trip/${currentTrip.id}/manage`

  const hasExpenseRecord = (membershipId: string) => {
    return currentTrip.expenses.some(
      (expense) =>
        expense.payerMembershipId === membershipId ||
        Boolean(expense.splits?.some((split) => split.membershipId === membershipId)),
    )
  }

  async function handleDeleteMember(memberId: string) {
    setDeletingMemberId(memberId)
    setDeleteMemberFlowPending(true)
    let shouldKeepLoadingState = false
    const deletingSelf = currentTrip.memberships.some(
      (member) =>
        member.id === memberId &&
        ((session?.user?.id && member.user.id === session.user.id) ||
          (currentUser?.email && member.user.email === currentUser.email)),
    )

    try {
      const result = await deleteMemberMutation.mutateAsync({ tripId: tripId!, memberId })

      if (result.status !== 204) {
        showError('移除成員失敗', result.data.message || '請稍後再試。')
        return
      }

      if (deletingSelf) {
        queryClient.removeQueries({ queryKey: [`/trips/${tripId}`] })
        await queryClient.invalidateQueries({ queryKey: ['/trips'] })
        showSuccess('你已離開旅程')
        shouldKeepLoadingState = true
        navigate('/', { replace: true })
        return
      }

      await queryClient.invalidateQueries({ queryKey: [`/trips/${tripId}`] })
      showSuccess('已移除成員')
    } catch {
      showError('移除成員失敗', '請稍後再試。')
    } finally {
      setDeletingMemberId(null)
      if (!shouldKeepLoadingState) {
        setDeleteMemberFlowPending(false)
      }
    }
  }

  async function handleCreateInviteLink() {
    try {
      const result = await createInvitationMutation.mutateAsync({ tripId: tripId! })
      if (result.status === 201) {
        setInviteToken(result.data.token)
        showSuccess('邀請連結已建立', '你可以直接複製連結分享給旅伴。')
      } else {
        showError('建立邀請失敗', '請稍後再試。')
      }
    } catch {
      showError('建立邀請失敗', '請稍後再試。')
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteToken) return
    const inviteLink = `${window.location.origin}/invitations/${inviteToken}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      showSuccess('已複製邀請連結')
    } catch {
      showError('複製失敗', '請檢查瀏覽器是否允許剪貼簿權限。')
    }
  }

  return (
    <div className="space-y-5 pb-4">
      {deleteMemberFlowPending || deleteMemberMutation.isPending || createInvitationMutation.isPending ? (
        <PageBlockingLoading
          title={deleteMemberFlowPending || deleteMemberMutation.isPending ? '更新成員中' : '建立邀請中'}
          description={
            deleteMemberFlowPending || deleteMemberMutation.isPending
              ? '正在同步成員變更，請稍候。'
              : '正在產生邀請連結，請稍候。'
          }
        />
      ) : null}
      <MobileHeader title="成員管理" backTo={backTo} />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(243,248,244,0.92))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">旅伴名單</p>
              <h2 className="text-2xl font-semibold">{currentTrip.memberships.length} 位成員</h2>
            </div>
            <Badge tone="green">邀請加入</Badge>
          </div>
        </CardContent>
      </Card>

      <SectionHeading title="邀請成員" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(244,250,251,0.96),rgba(248,252,252,0.92))]">
        <CardContent className="space-y-3 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">邀請好友加入</p>
              <p className="text-sm text-muted-foreground">產生邀請連結分享給旅伴</p>
            </div>
            <Badge tone="blue">協作</Badge>
          </div>

          {inviteToken ? (
            <>
              <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground break-all">
                {`${window.location.origin}/invitations/${inviteToken}`}
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={handleCopyInviteLink}>
                <Copy className="h-4 w-4" />
                複製邀請連結
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={handleCreateInviteLink} disabled={createInvitationMutation.isPending}>
              {createInvitationMutation.isPending ? '建立中...' : '產生邀請連結'}
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="目前成員" />
        {isTripOwner ? (
          <p className="inline-flex items-center gap-1 text-right text-xs font-medium text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            已有支出紀錄的成員不可刪除
          </p>
        ) : (
          <p className="text-right text-xs font-medium text-muted-foreground">僅旅程建立者可移除成員</p>
        )}
      </div>

      <div className="space-y-3">
        {currentTrip.memberships.length === 0 ? (
          <EmptyState title="尚未加入旅伴" description="產生邀請連結分享給朋友，讓他們加入旅程。" />
        ) : currentTrip.memberships.map((member) => {
          const locked = hasExpenseRecord(member.id)

          return (
            <Card key={member.id}>
              <CardContent className="flex items-center justify-between gap-3 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D5E9EF] text-sm font-semibold">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {locked ? '已有支出紀錄，不可刪除' : member.user.email}
                    </p>
                  </div>
                </div>
                {isTripOwner ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={locked || deleteMemberFlowPending || deleteMemberMutation.isPending}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                      locked || deleteMemberFlowPending || deleteMemberMutation.isPending
                        ? 'cursor-not-allowed border-border bg-[#F4F7F8] text-muted-foreground'
                        : 'border-[#EBCACA] bg-[#FFF5F5] text-[#C96B6B]'
                    }`}
                  >
                    {deletingMemberId === member.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
