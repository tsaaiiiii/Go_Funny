import { AlertTriangle, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { SectionHeading } from '@/components/ui/section-heading'
import { useGetTripById } from '@/api/generated/trips/trips'
import { useDeleteTripMember } from '@/api/generated/members/members'
import { useCreateTripInvitation } from '@/api/generated/invitations/invitations'
import { hasStatus } from '@/lib/api-response'

export function MembersPage() {
  const { tripId } = useParams()
  const queryClient = useQueryClient()
  const { data: tripResponse } = useGetTripById(tripId!)
  const trip = hasStatus(tripResponse, 200) ? tripResponse.data : null
  const deleteMemberMutation = useDeleteTripMember()
  const createInvitationMutation = useCreateTripInvitation()
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!trip) {
    return null
  }

  const hasExpenseRecord = (membershipId: string) => {
    return trip.expenses.some(
      (expense) =>
        expense.payerMembershipId === membershipId ||
        Boolean(expense.splits?.some((split) => split.membershipId === membershipId)),
    )
  }

  async function handleDeleteMember(memberId: string) {
    await deleteMemberMutation.mutateAsync({ tripId: tripId!, memberId })
    await queryClient.invalidateQueries({ queryKey: [`/trips/${tripId}`] })
  }

  async function handleCreateInviteLink() {
    const result = await createInvitationMutation.mutateAsync({ tripId: tripId!, data: {} })
    if (result.status === 201) {
      setInviteToken(result.data.token)
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteToken) return
    const inviteLink = `${window.location.origin}/invitations/${inviteToken}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="成員管理" backTo={`/trip/${trip.id}/manage`} />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(243,248,244,0.92))] shadow-float">
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">旅伴名單</p>
              <h2 className="text-2xl font-semibold">{trip.memberships.length} 位成員</h2>
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
                {copied ? '已複製連結' : '複製邀請連結'}
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={handleCreateInviteLink}>
              產生邀請連結
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <SectionHeading title="目前成員" />
        <p className="inline-flex items-center gap-1 text-right text-xs font-medium text-danger">
          <AlertTriangle className="h-3.5 w-3.5" />
          已有支出紀錄的成員不可刪除
        </p>
      </div>

      <div className="space-y-3">
        {trip.memberships.length === 0 ? (
          <EmptyState title="尚未加入旅伴" description="產生邀請連結分享給朋友，讓他們加入旅程。" />
        ) : trip.memberships.map((member) => {
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
                <button
                  type="button"
                  onClick={() => handleDeleteMember(member.id)}
                  disabled={locked}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                    locked
                      ? 'cursor-not-allowed border-border bg-[#F4F7F8] text-muted-foreground'
                      : 'border-[#EBCACA] bg-[#FFF5F5] text-[#C96B6B]'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
