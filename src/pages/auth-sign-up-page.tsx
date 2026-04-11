import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { MobileHeader } from '@/components/layout/mobile-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { queueFlashToast, useToast } from '@/components/ui/toast'
import { authClient, getAuthErrorMessage } from '@/lib/auth-client'

const signUpSchema = z.object({
  name: z.string().trim().min(1, '請輸入名稱'),
  email: z.string().trim().email('請輸入有效的 Email'),
  password: z.string().min(8, '密碼至少需要 8 碼'),
})

type SignUpField = 'name' | 'email' | 'password'
type SignUpErrors = Partial<Record<SignUpField, string>>

export function AuthSignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showError } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailPending, setEmailPending] = useState(false)
  const [errors, setErrors] = useState<SignUpErrors>({})
  const inviteToken = searchParams.get('invite')?.trim() ?? ''
  const nextPath = inviteToken ? `/invitations/${inviteToken}?autoJoin=1` : '/'
  const loginPath = inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : '/login'

  async function handleEmailSignUp() {
    const validationResult = signUpSchema.safeParse({ name, email, password })

    if (!validationResult.success) {
      const nextErrors: SignUpErrors = {}

      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0]

        if (field === 'name' || field === 'email' || field === 'password') {
          nextErrors[field] ??= issue.message
        }
      })

      setErrors(nextErrors)
      return
    }

    setErrors({})
    setEmailPending(true)
    try {
      const { error } = await authClient.signUp.email({
        name: validationResult.data.name,
        email: validationResult.data.email,
        password: validationResult.data.password,
        callbackURL: nextPath,
      })

      if (error) {
        const message = getAuthErrorMessage(error, '註冊失敗，請稍後再試。')

        if (error.code === 'USER_ALREADY_EXISTS' || error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
          setErrors((current) => ({ ...current, email: message }))
        } else {
          showError('註冊失敗', message)
        }

        return
      }

      queueFlashToast({ tone: 'success', title: '註冊成功', description: '帳號已建立，正在為你進入首頁。' })
      navigate(nextPath, { replace: true })
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
            <div className="space-y-1.5">
              <div className={`flex h-12 items-center gap-3 rounded-2xl border bg-white px-4 focus-within:border-primary ${errors.name ? 'border-danger' : 'border-border'}`}>
                <UserRound className="h-4 w-4 text-primary" />
                <input
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="名稱"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setErrors((current) => ({ ...current, name: undefined }))
                  }}
                />
              </div>
              {errors.name ? <p className="px-1 text-xs text-danger">{errors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <div className={`flex h-12 items-center gap-3 rounded-2xl border bg-white px-4 focus-within:border-primary ${errors.email ? 'border-danger' : 'border-border'}`}>
                <Mail className="h-4 w-4 text-primary" />
                <input
                  type="email"
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrors((current) => ({ ...current, email: undefined }))
                  }}
                />
              </div>
              {errors.email ? <p className="px-1 text-xs text-danger">{errors.email}</p> : null}
            </div>
            <div className="space-y-1.5">
              <div className={`flex h-12 items-center gap-3 rounded-2xl border bg-white px-4 focus-within:border-primary ${errors.password ? 'border-danger' : 'border-border'}`}>
                <LockKeyhole className="h-4 w-4 text-primary" />
                <input
                  type="password"
                  className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  placeholder="密碼"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setErrors((current) => ({ ...current, password: undefined }))
                  }}
                />
              </div>
              {errors.password ? <p className="px-1 text-xs text-danger">{errors.password}</p> : <p className="px-1 text-xs text-muted-foreground">密碼至少需要 8 碼</p>}
            </div>
          </div>

          <Button className="w-full gap-2" onClick={handleEmailSignUp} disabled={!name || !email || !password || emailPending}>
            <ArrowRight className="h-4 w-4" />
            {emailPending ? '註冊中...' : '使用 Email 註冊'}
          </Button>

          <p className="text-sm text-muted-foreground">
            已經有帳號？ <Link to={loginPath} className="font-medium text-primary">前往登入</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
