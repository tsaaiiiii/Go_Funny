import { ArrowRight, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/google-icon'
import { authClient } from '@/lib/auth-client'
import { isMockAuthEnabled, writeMockSession } from '@/lib/mock-session'

export function AuthSignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  async function handleEmailSignIn() {
    setStatus('')

    if (isMockAuthEnabled() && email === 'example.com' && password === 'example') {
      writeMockSession({
        user: {
          email: 'example.com',
          name: 'example',
        },
      })
      navigate('/')
      return
    }

    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: '/',
      })
    } catch {
      setStatus('登入流程需等待 Better Auth 後端完成後才能正常運作。')
    }
  }

  async function handleGoogleSignIn() {
    setStatus('')

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch {
      setStatus('Google 登入需等待 Better Auth 與 Google Provider 完成設定。')
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="登入" backTo="/" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div>
            <p className="text-sm text-muted-foreground">帳號同步</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">登入後可跨裝置使用旅程資料</h2>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            使用 Google 登入
          </Button>

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

          <Button className="w-full gap-2" onClick={handleEmailSignIn} disabled={!email || !password}>
            <ArrowRight className="h-4 w-4" />
            使用 Email 登入
          </Button>

          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

          <p className="text-sm text-muted-foreground">
            還沒有帳號？ <Link to="/register" className="font-medium text-primary">建立帳號</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
