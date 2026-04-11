import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { authClient, getAuthErrorMessage } from '@/lib/auth-client'
import { isMockAuthEnabled, writeMockSession } from '@/lib/mock-session'

export function AuthSignInPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailPending, setEmailPending] = useState(false)
  const inviteToken = searchParams.get('invite')?.trim() ?? ''
  const nextPath = inviteToken ? `/invitations/${inviteToken}?autoJoin=1` : '/'
  const registerPath = inviteToken ? `/register?invite=${encodeURIComponent(inviteToken)}` : '/register'

  async function handleEmailSignIn() {
    setEmailPending(true)
    if (isMockAuthEnabled() && email === 'example.com' && password === 'example') {
      writeMockSession({
        user: {
          email: 'example.com',
          name: 'example',
        },
      })
      queueFlashToast({ tone: 'success', title: '登入成功', description: '已使用本地 mock 帳號登入。' })
      navigate(nextPath)
      return
    }

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: nextPath,
      })

      if (error) {
        showError('登入失敗', getAuthErrorMessage(error, '登入失敗，請稍後再試。'))
        return
      }

      queueFlashToast({ tone: 'success', title: '登入成功', description: '歡迎回來，旅程資料已同步。' })
      navigate(nextPath, { replace: true })
    } catch {
      showError('登入失敗', '登入流程尚未完成，或目前帳號服務不可用。')
    } finally {
      setEmailPending(false)
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="登入" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div>
            <p className="text-sm text-muted-foreground">帳號同步</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">登入後可跨裝置使用旅程資料</h2>
          </div>

          <div className="space-y-3">
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
              <Mail className="h-4 w-4 text-primary" />
              <input
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
              <LockKeyhole className="h-4 w-4 text-primary" />
              <input
                type="password"
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="密碼"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleEmailSignIn} disabled={!email || !password || emailPending}>
            <ArrowRight className="h-4 w-4" />
            {emailPending ? '登入中...' : '使用 Email 登入'}
          </Button>

          <p className="text-sm text-muted-foreground">
            還沒有帳號？ <Link to={registerPath} className="font-medium text-primary">建立帳號</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
