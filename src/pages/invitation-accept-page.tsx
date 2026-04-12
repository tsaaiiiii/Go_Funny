import { useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle2, MapPin, Users } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { useAcceptTripInvitation, useGetInvitationByToken } from '@/api/generated/invitations/invitations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { MobileHeader } from '@/components/layout/mobile-header'
import { PageBlockingLoading } from '@/components/ui/page-blocking-loading'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { hasStatus } from '@/lib/api-response'
import { authClient } from '@/lib/auth-client'

const tripModeLabel = {
  expense: '一般記帳',
  pool: '公積金',
} as const

const invitationRoleLabel = {
  editor: '可共同編輯',
} as const

export function InvitationAcceptPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showError } = useToast()
  const { token = '' } = useParams()
  const autoJoinRequested = searchParams.get('autoJoin') === '1'
  const autoJoinStartedRef = useRef(false)
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: invitationResponse, isPending: invitationPending } = useGetInvitationByToken(token, {
    query: {
      enabled: !!token,
      retry: false,
    },
  })
  const acceptInvitationMutation = useAcceptTripInvitation()

  const invitation = hasStatus(invitationResponse, 200) ? invitationResponse.data : null
  const notFound = hasStatus(invitationResponse, 404)

  useEffect(() => {
    if (!autoJoinRequested || !session?.user || !invitation || autoJoinStartedRef.current) {
      return
    }

    autoJoinStartedRef.current = true
    void handleAcceptInvitation()
  }, [autoJoinRequested, invitation, session?.user])

  if (!token) {
    return (
      <EmptyState
        title="找不到邀請連結"
        description="這個邀請連結格式不正確，請重新確認後再試一次。"
      />
    )
  }

  if (invitationPending || sessionPending) {
    return <LoadingState title="邀請資料載入中" description="正在確認旅程邀請內容。" />
  }

  if (notFound) {
    return (
      <div className="space-y-5 pb-4">
        <MobileHeader title="加入旅程" backTo="/" />
        <EmptyState
          title="邀請連結不存在"
          description="這個邀請可能已失效，請請旅程成員重新產生新的邀請連結。"
          action={
            <Link to="/" className="inline-flex">
              <Button variant="outline">回到首頁</Button>
            </Link>
          }
        />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="space-y-5 pb-4">
        <MobileHeader title="加入旅程" backTo="/" />
        <EmptyState
          title="目前無法讀取邀請資料"
          description="請稍後再試一次，或請旅程成員重新分享邀請連結。"
        />
      </div>
    )
  }

  const trip = invitation.trip
  const roleLabel = invitationRoleLabel[invitation.role] ?? invitation.role
  const modeLabel = tripModeLabel[trip.mode] ?? trip.mode

  async function handleAcceptInvitation() {
    try {
      const response = await acceptInvitationMutation.mutateAsync({ token })

      if (response.status === 201) {
        queueFlashToast({
          tone: 'success',
          title: '已加入旅程',
          description: `你已加入「${trip.title}」。`,
        })
        navigate('/', { replace: true })
        return
      }

      showError('加入旅程失敗', response.data.message)
    } catch {
      showError('加入旅程失敗', '請稍後再試。')
    }
  }

  return (
    <div className="space-y-5 pb-4">
      {acceptInvitationMutation.isPending ? (
        <PageBlockingLoading title="加入旅程中" description="正在接受邀請並同步旅程資料。" />
      ) : null}
      <MobileHeader title="加入旅程" backTo="/" />

      <Card className="overflow-hidden border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.98),rgba(240,247,246,0.94))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF7F8] text-primary">
              <Users className="h-7 w-7" />
            </div>
            <Badge tone={trip.mode === 'pool' ? 'green' : 'blue'}>{modeLabel}</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">旅程邀請</p>
            <h2 className="text-2xl font-semibold leading-tight text-foreground">{trip.title}</h2>
            {trip.location ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{trip.location}</span>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-muted-foreground">模式</p>
              <p className="mt-1 font-semibold text-foreground">{modeLabel}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-muted-foreground">權限</p>
              <p className="mt-1 font-semibold text-foreground">{roleLabel}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-white/75 px-4 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <p className="text-sm leading-6 text-muted-foreground">
                {session?.user
                  ? '確認後會直接加入這趟旅程，之後就能查看與編輯相關記帳內容。'
                  : '登入後即可加入這趟旅程，並和其他成員一起記帳與查看結算。'}
              </p>
            </div>
          </div>

          {session?.user ? (
            <Button className="w-full gap-2" onClick={handleAcceptInvitation} disabled={acceptInvitationMutation.isPending}>
              <ArrowRight className="h-4 w-4" />
              {acceptInvitationMutation.isPending ? '加入中...' : '接受邀請並加入'}
            </Button>
          ) : (
            <Link to={`/login?invite=${encodeURIComponent(token)}`} className="block">
              <Button className="w-full gap-2">
                <ArrowRight className="h-4 w-4" />
                前往登入後加入
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
