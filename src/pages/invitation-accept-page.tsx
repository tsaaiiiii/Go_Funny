import { ArrowRight, CheckCircle2, Chrome, Link2, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { authClient } from '@/lib/auth-client'

export function InvitationAcceptPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('')
  const inviteToken = useMemo(() => token ?? '', [token])
  const tokenPreview = useMemo(() => inviteToken.slice(0, 8) || 'draft-link', [inviteToken])

  async function handleContinueWithGoogle() {
    setStatus('')

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `/invitations/${inviteToken}`,
      })
    } catch {
      setStatus('接受邀請流程需要 Better Auth 與邀請 API 完成後才能正式運作。')
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="加入旅程" backTo="/" />

      <Card className="overflow-hidden border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.98),rgba(240,247,246,0.94))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF7F8] text-primary">
              <Users className="h-7 w-7" />
            </div>
            <Badge tone="blue">共同編輯邀請</Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">邀請連結</p>
            <h2 className="text-2xl font-semibold leading-tight text-foreground">你被邀請加入這趟旅程，和朋友一起記帳。</h2>
            <p className="text-sm leading-6 text-muted-foreground">完成登入後，你會被加入旅程成員，並可共同編輯支出與分帳內容。</p>
          </div>

          <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(95,168,184,0.12),rgba(127,167,138,0.1))] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge tone="green">公積金</Badge>
                  <span className="text-xs text-muted-foreground">Token · {tokenPreview}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">沖繩海風小旅行</p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>沖繩 · 日本</span>
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#D5E9EF] text-sm font-semibold text-foreground">A</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#DCEAD9] text-sm font-semibold text-foreground">S</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#EFE2D4] text-sm font-semibold text-foreground">N</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-muted-foreground">角色</p>
              <p className="mt-1 font-semibold text-foreground">成員 + 編輯者</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-muted-foreground">權限</p>
              <p className="mt-1 font-semibold text-foreground">可共同編輯</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-3">
              <p className="text-muted-foreground">加入方式</p>
              <p className="mt-1 font-semibold text-foreground">Google</p>
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleContinueWithGoogle}>
            <Chrome className="h-4 w-4" />
            使用 Google 繼續
          </Button>

          <div className="rounded-3xl border border-border/70 bg-white/75 px-4 py-4">
            <div className="mb-3 flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              加入後你可以做的事
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-secondary" />
                <span>加入這趟旅程並自動成為成員</span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>查看每日支出、共同編輯與更新紀錄</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>正式版本將由後端驗證 token 有效性與權限</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-white/60 px-4 py-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Link2 className="h-4 w-4 text-primary" />
              目前狀態
            </div>
            這是前端接受邀請頁的高擬真畫面，實際加入流程仍需等 Better Auth 與 invitation API 完成後接通。
          </div>

          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

          <p className="text-sm text-muted-foreground">
            想先看看產品？ <Link to="/" className="font-medium text-primary">回到首頁</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
