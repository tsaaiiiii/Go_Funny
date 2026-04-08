import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { authClient } from '@/lib/auth-client'

export function AuthSignUpPage() {
  const navigate = useNavigate()
  const { showError } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailPending, setEmailPending] = useState(false)

  async function handleEmailSignUp() {
    setEmailPending(true)
    try {
      await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/',
      })
      queueFlashToast({ tone: 'success', title: '註冊成功', description: '帳號已建立，正在為你進入首頁。' })
      navigate('/', { replace: true })
    } catch {
      showError('註冊失敗', '註冊流程尚未完成，或目前帳號服務不可用。')
    } finally {
      setEmailPending(false)
    }
  }

  return (
    <div className="space-y-5 pb-4">
      <MobileHeader title="建立帳號" />

      <Card className="border-none bg-[linear-gradient(180deg,rgba(255,253,252,0.96),rgba(240,247,246,0.92))] shadow-float">
        <CardContent className="space-y-5 pt-5">
          <div>
            <p className="text-sm text-muted-foreground">Better Auth</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">註冊後可與旅伴共同編輯旅程</h2>
          </div>

          <div className="space-y-3">
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4 focus-within:border-primary">
              <UserRound className="h-4 w-4 text-primary" />
              <input
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="名稱"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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

          <Button className="w-full gap-2" onClick={handleEmailSignUp} disabled={!name || !email || !password || emailPending}>
            <ArrowRight className="h-4 w-4" />
            {emailPending ? '註冊中...' : '使用 Email 註冊'}
          </Button>

          <p className="text-sm text-muted-foreground">
            已經有帳號？ <Link to="/login" className="font-medium text-primary">前往登入</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
